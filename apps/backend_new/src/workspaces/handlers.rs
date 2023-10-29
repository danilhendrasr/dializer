use std::str::FromStr;

use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::{Pool, Postgres};
use uuid::Uuid;

use crate::types::{AppError, Workspace};

pub async fn get_workspace_by_id(
    State(db_pool): State<Pool<Postgres>>,
    Path(workspace_id): Path<String>,
) -> Result<Json<Workspace>, AppError> {
    let workspace_uuid = Uuid::from_str(&workspace_id)?;

    let result = sqlx::query_as!(
        Workspace,
        r#"SELECT 
            id,
            title,
            description,
            visibility as "visibility: _", 
            created_at, 
            updated_at, 
            owner_id 
        FROM public.workspaces 
        WHERE id = $1"#,
        workspace_uuid,
    )
    .fetch_one(&db_pool)
    .await?;

    Ok(Json(result))
}

pub async fn delete_workspace_by_id(
    State(db_pool): State<Pool<Postgres>>,
    Path(workspace_id): Path<String>,
) -> Result<Json<Workspace>, AppError> {
    let workspace_uuid = Uuid::from_str(&workspace_id)?;

    let result = sqlx::query_as!(
        Workspace,
        r#"DELETE FROM public.workspaces 
        WHERE id = $1 
        RETURNING id,
            title,
            description,
            visibility as "visibility: _",
            created_at,
            updated_at,
            owner_id"#,
        workspace_uuid,
    )
    .fetch_one(&db_pool)
    .await?;

    Ok(Json(result))
}
