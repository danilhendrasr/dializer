use std::str::FromStr;

use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use sqlx::{Pool, Postgres, QueryBuilder};
use uuid::Uuid;

use crate::types::{AppError, User, UserResponse, Workspace};

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
pub struct UpdateUserPayload {
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub password: Option<String>,
}

pub async fn update_user(
    State(db_pool): State<Pool<Postgres>>,
    Path(user_id): Path<Uuid>,
    Json(user): Json<UpdateUserPayload>,
) -> Result<Json<UserResponse>, AppError> {
    let mut trx = db_pool.clone().begin().await?;

    let existing_user = sqlx::query_as!(User, r#"SELECT * FROM public.users WHERE id=$1"#, user_id)
        .fetch_one(&mut *trx)
        .await?;

    let user = User {
        full_name: user.full_name.unwrap_or(existing_user.full_name),
        email: user.email.unwrap_or(existing_user.email),
        ..existing_user
    };

    let user = sqlx::query_as!(
        UserResponse,
        r#"UPDATE public.users 
            SET full_name = $1, email = $2
            WHERE id = $3
            RETURNING id, full_name, email"#,
        user.full_name,
        user.email,
        user_id
    )
    .fetch_one(&mut *trx)
    .await?;

    trx.commit().await?;

    Ok(Json(user))
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
