use std::str::FromStr;

use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use sqlx::{Pool, Postgres, QueryBuilder};
use uuid::Uuid;

use crate::types::{AppError, UserResponse, Workspace};

pub async fn get_user_by_id(
    State(db_pool): State<Pool<Postgres>>,
    Path(user_id): Path<String>,
) -> Result<Json<UserResponse>, AppError> {
    let uuid = Uuid::from_str(user_id.as_str())?;
    let result = sqlx::query_as!(
        UserResponse,
        r#"SELECT 
                id, full_name, email
            FROM public.users 
            WHERE id = $1"#,
        uuid
    )
    .fetch_one(&db_pool)
    .await?;

    Ok(Json(result))
}

#[derive(Deserialize)]
pub struct GetUserWorkspacesQuery {
    pub search: Option<String>,
}

pub async fn get_user_workspaces(
    State(db_pool): State<Pool<Postgres>>,
    Path(user_id): Path<String>,
    Query(query): Query<GetUserWorkspacesQuery>,
) -> Result<Json<Vec<Workspace>>, AppError> {
    let uuid = Uuid::from_str(user_id.as_str())?;
    let _ = get_user_by_id(State(db_pool.to_owned()), Path(user_id.to_owned())).await?;

    let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(
        "SELECT 
            id,
            title, 
            description, 
            visibility, 
            created_at, 
            updated_at, 
            owner_id 
        FROM public.workspaces 
        WHERE owner_id = ",
    );
    query_builder.push_bind(uuid);

    if let Some(search) = query.search {
        let search = format!("%{}%", search);
        query_builder.push(" AND (title ILIKE ");
        query_builder.push_bind(search.to_owned());
        query_builder.push(" OR description ILIKE ");
        query_builder.push_bind(search.to_owned());
        query_builder.push(")");
    }

    let workspaces = query_builder
        .build_query_as::<Workspace>()
        .fetch_all(&db_pool)
        .await?;

    Ok(Json(workspaces))
}
