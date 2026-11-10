// Leaderboards (ISteamUserStats), added for ASHWING: steamworks.js 0.4.0 has none.
// See ../../PATCHES.md. The underlying calls come from steamworks-rs (user_stats.rs).
//
// JavaScript addresses boards by name. steamworks-rs can't rebuild a board handle from a raw id, so handles found
// once are cached here by name for the life of the process.
use napi_derive::napi;
use std::collections::HashMap;
use std::sync::Mutex;

lazy_static! {
    static ref BOARDS: Mutex<HashMap<String, steamworks::Leaderboard>> = Mutex::new(HashMap::new());
}

/// Steam keeps at most 64 detail values per entry (k_cLeaderboardDetailsMax).
const MAX_DETAILS: usize = 64;

fn cached(name: &str) -> Option<steamworks::Leaderboard> {
    BOARDS.lock().unwrap().get(name).cloned()
}

async fn lookup(
    name: String,
    create: Option<(steamworks::LeaderboardSortMethod, steamworks::LeaderboardDisplayType)>,
) -> Result<Option<steamworks::Leaderboard>, napi::Error> {
    if let Some(lb) = cached(&name) {
        return Ok(Some(lb));
    }
    let client = crate::client::get_client();
    let (tx, rx) = tokio::sync::oneshot::channel();
    match create {
        Some((sort, display)) => {
            client
                .user_stats()
                .find_or_create_leaderboard(&name, sort, display, move |r| {
                    let _ = tx.send(r);
                })
        }
        None => client.user_stats().find_leaderboard(&name, move |r| {
            let _ = tx.send(r);
        }),
    }
    let result = rx
        .await
        .map_err(|_| napi::Error::from_reason("Steam did not answer the leaderboard request"))?;
    match result {
        Ok(Some(lb)) => {
            BOARDS.lock().unwrap().insert(name, lb.clone());
            Ok(Some(lb))
        }
        Ok(None) => Ok(None),
        Err(e) => Err(napi::Error::from_reason(e.to_string())),
    }
}

#[napi]
pub mod leaderboard {
    use crate::api::localplayer::PlayerSteamId;
    use napi::bindgen_prelude::Error;
    use tokio::sync::oneshot;

    #[napi]
    pub enum SortMethod {
        Ascending,
        Descending,
    }

    #[napi]
    pub enum DisplayType {
        Numeric,
        TimeSeconds,
        TimeMilliSeconds,
    }

    #[napi]
    pub enum DataRequest {
        /// ranks `start` to `end` (1-based, inclusive) of everyone
        Global,
        /// `start` to `end` relative to the current user: -4, 5 = four above to five below
        GlobalAroundUser,
        /// the current user's friends (and the user); `start` and `end` are ignored
        Friends,
    }

    #[napi]
    pub enum UploadScoreMethod {
        /// keep the better of the old and the new score
        KeepBest,
        /// always replace the old score
        ForceUpdate,
    }

    #[napi(object)]
    pub struct LeaderboardEntry {
        pub global_rank: i32,
        pub score: i32,
        pub steam_id: PlayerSteamId,
        /// the Steam persona name, if Steam knows it ("" otherwise)
        pub name: String,
        pub details: Vec<i32>,
    }

    #[napi(object)]
    pub struct UploadScoreResult {
        pub score: i32,
        /// false when KeepBest kept an older, better score
        pub score_changed: bool,
        pub global_rank_new: i32,
        pub global_rank_previous: i32,
    }

    impl From<SortMethod> for steamworks::LeaderboardSortMethod {
        fn from(v: SortMethod) -> Self {
            match v {
                SortMethod::Ascending => steamworks::LeaderboardSortMethod::Ascending,
                SortMethod::Descending => steamworks::LeaderboardSortMethod::Descending,
            }
        }
    }

    impl From<DisplayType> for steamworks::LeaderboardDisplayType {
        fn from(v: DisplayType) -> Self {
            match v {
                DisplayType::Numeric => steamworks::LeaderboardDisplayType::Numeric,
                DisplayType::TimeSeconds => steamworks::LeaderboardDisplayType::TimeSeconds,
                DisplayType::TimeMilliSeconds => steamworks::LeaderboardDisplayType::TimeMilliSeconds,
            }
        }
    }

    /// Looks a board up by name. Resolves true when it exists.
    ///
    /// {@link https://partner.steamgames.com/doc/api/ISteamUserStats#FindLeaderboard}
    #[napi]
    pub async fn find(name: String) -> Result<bool, Error> {
        Ok(super::lookup(name, None).await?.is_some())
    }

    /// Looks a board up by name and creates it with this sort order and display type when it doesn't exist yet
    /// (boards created this way are visible to players; create them in Steamworks to keep them hidden).
    ///
    /// {@link https://partner.steamgames.com/doc/api/ISteamUserStats#FindOrCreateLeaderboard}
    #[napi]
    pub async fn find_or_create(name: String, sort: SortMethod, display: DisplayType) -> Result<bool, Error> {
        Ok(super::lookup(name, Some((sort.into(), display.into())))
            .await?
            .is_some())
    }

    /// Uploads the current user's score (and up to 64 detail integers) to a board found by name.
    /// Resolves null when Steam refused the upload.
    ///
    /// {@link https://partner.steamgames.com/doc/api/ISteamUserStats#UploadLeaderboardScore}
    #[napi]
    pub async fn upload_score(
        name: String,
        score: i32,
        method: UploadScoreMethod,
        details: Option<Vec<i32>>,
    ) -> Result<Option<UploadScoreResult>, Error> {
        let details = details.unwrap_or_default();
        if details.len() > super::MAX_DETAILS {
            return Err(Error::from_reason("A leaderboard entry holds at most 64 details"));
        }
        let lb = super::lookup(name.clone(), None)
            .await?
            .ok_or_else(|| Error::from_reason(format!("Leaderboard not found: {}", name)))?;
        let method = match method {
            UploadScoreMethod::KeepBest => steamworks::UploadScoreMethod::KeepBest,
            UploadScoreMethod::ForceUpdate => steamworks::UploadScoreMethod::ForceUpdate,
        };
        let client = crate::client::get_client();
        let (tx, rx) = oneshot::channel();
        client
            .user_stats()
            .upload_leaderboard_score(&lb, method, score, &details, move |r| {
                let _ = tx.send(r);
            });
        let result = rx
            .await
            .map_err(|_| Error::from_reason("Steam did not answer the score upload"))?;
        match result {
            Ok(Some(u)) => Ok(Some(UploadScoreResult {
                score: u.score,
                score_changed: u.was_changed,
                global_rank_new: u.global_rank_new,
                global_rank_previous: u.global_rank_previous,
            })),
            Ok(None) => Ok(None),
            Err(e) => Err(Error::from_reason(e.to_string())),
        }
    }

    /// Downloads entries of a board found by name.
    ///
    /// {@link https://partner.steamgames.com/doc/api/ISteamUserStats#DownloadLeaderboardEntries}
    #[napi]
    pub async fn download_scores(
        name: String,
        request: DataRequest,
        start: i32,
        end: i32,
    ) -> Result<Vec<LeaderboardEntry>, Error> {
        let lb = super::lookup(name.clone(), None)
            .await?
            .ok_or_else(|| Error::from_reason(format!("Leaderboard not found: {}", name)))?;
        let request = match request {
            DataRequest::Global => steamworks::LeaderboardDataRequest::Global,
            DataRequest::GlobalAroundUser => steamworks::LeaderboardDataRequest::GlobalAroundUser,
            DataRequest::Friends => steamworks::LeaderboardDataRequest::Friends,
        };
        let client = crate::client::get_client();
        let (tx, rx) = oneshot::channel();
        // steamworks-rs takes usize and hands it to Steam as a 32-bit int; going through isize keeps negative
        // offsets (GlobalAroundUser) intact, since the cast back to 32 bits keeps the low bits.
        client.user_stats().download_leaderboard_entries(
            &lb,
            request,
            start as isize as usize,
            end as isize as usize,
            super::MAX_DETAILS,
            move |r| {
                let _ = tx.send(r);
            },
        );
        let result = rx
            .await
            .map_err(|_| Error::from_reason("Steam did not answer the leaderboard download"))?;
        let entries = result.map_err(|e| Error::from_reason(e.to_string()))?;
        let friends = client.friends();
        Ok(entries
            .into_iter()
            .map(|e| LeaderboardEntry {
                global_rank: e.global_rank,
                score: e.score,
                name: friends.get_friend(e.user).name(),
                steam_id: PlayerSteamId::from_steamid(e.user),
                details: e.details,
            })
            .collect())
    }

    /// Number of entries on a board that was already found by name in this session, or null.
    ///
    /// {@link https://partner.steamgames.com/doc/api/ISteamUserStats#GetLeaderboardEntryCount}
    #[napi]
    pub fn get_entry_count(name: String) -> Option<i32> {
        let lb = super::cached(&name)?;
        Some(crate::client::get_client().user_stats().get_leaderboard_entry_count(&lb))
    }
}
