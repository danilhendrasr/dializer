use std::str::FromStr;

use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::{Pool, Postgres};
use uuid::Uuid;

use crate::types::{AppError, User};

pub async fn get_user_by_id(
    State(db_pool): State<Pool<Postgres>>,
    Path(user_id): Path<String>,
) -> Result<Json<User>, AppError> {
    let uuid = Uuid::from_str(user_id.as_str())?;
    let result = sqlx::query_as!(User, r#"SELECT * FROM public.users WHERE id = $1"#, uuid)
        .fetch_one(&db_pool)
        .await?;

    Ok(Json(result))
}
