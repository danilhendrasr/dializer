use std::str::FromStr;

use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::{Pool, Postgres};
use uuid::Uuid;

use crate::types::{AppError, User, Workspace};

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

pub async fn get_user_workspaces(
    State(db_pool): State<Pool<Postgres>>,
    Path(user_id): Path<String>,
) -> Result<Json<Vec<Workspace>>, AppError> {
    let uuid = Uuid::from_str(user_id.as_str())?;
    let _ = get_user_by_id(State(db_pool.to_owned()), Path(user_id.to_owned())).await?;
    let workspaces = sqlx::query_as!(
        Workspace,
        r#"SELECT 
            id,
            title, 
            description, 
            visibility AS "visibility: _", 
            created_at, 
            updated_at, 
            owner_id 
        FROM public.workspaces 
        WHERE owner_id = $1"#,
        uuid
    )
    .fetch_all(&db_pool)
    .await?;

    Ok(Json(workspaces))
}
