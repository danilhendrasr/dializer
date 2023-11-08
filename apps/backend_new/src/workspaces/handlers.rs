use std::str::FromStr;

use axum::{
    extract::{Path, State},
    Json,
};
use serde::Deserialize;
use sqlx::{Pool, Postgres};
use uuid::Uuid;

use crate::types::{AppError, Node, NodeType, Workspace, WorkspaceVisibility};

pub async fn get_workspace_by_id(
    State(db_pool): State<Pool<Postgres>>,
    Path(workspace_id): Path<Uuid>,
) -> Result<Json<Workspace>, AppError> {
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
        workspace_id,
    )
    .fetch_one(&db_pool)
    .await?;

    Ok(Json(result))
}

#[derive(Deserialize)]
pub struct CreateWorkspacePayload {
    pub title: String,
    pub description: Option<String>,
    pub visibility: WorkspaceVisibility,
    pub owner_id: Uuid,
}

pub async fn create_workspace(
    State(db_pool): State<Pool<Postgres>>,
    Json(workspace): Json<CreateWorkspacePayload>,
) -> Result<Json<Workspace>, AppError> {
    let result = sqlx::query_as!(
        Workspace,
        r#"INSERT INTO public.workspaces (title, description, visibility, owner_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id,
            title,
            description,
            visibility as "visibility: _",
            created_at,
            updated_at,
            owner_id"#,
        workspace.title,
        workspace.description,
        workspace.visibility as WorkspaceVisibility,
        workspace.owner_id,
    )
    .fetch_one(&db_pool)
    .await?;

    Ok(Json(result))
}

#[derive(Deserialize)]
pub struct UpdateWorkspacePayload {
    pub title: Option<String>,
    pub description: Option<String>,
    pub visibility: Option<WorkspaceVisibility>,
    pub owner_id: Option<Uuid>,
}

pub async fn update_workspace_by_id(
    State(db_pool): State<Pool<Postgres>>,
    Path(workspace_id): Path<Uuid>,
    Json(workspace): Json<UpdateWorkspacePayload>,
) -> Result<Json<Workspace>, AppError> {
    let mut chosen_workspace = get_workspace_by_id(State(db_pool.to_owned()), Path(workspace_id))
        .await?
        .0;

    if let Some(title) = workspace.title {
        chosen_workspace.title = title;
    }

    if let Some(description) = workspace.description {
        chosen_workspace.description = Some(description);
    }

    if let Some(visibility) = workspace.visibility {
        chosen_workspace.visibility = visibility;
    }

    if let Some(owner_id) = workspace.owner_id {
        chosen_workspace.owner_id = owner_id;
    }

    let result = sqlx::query_as!(
        Workspace,
        r#"UPDATE public.workspaces 
        SET title = $1, 
            description = $2, 
            visibility = $3, 
            owner_id = $4 
        WHERE id = $5 
        RETURNING id,
            title,
            description,
            visibility as "visibility: _",
            created_at,
            updated_at,
            owner_id"#,
        chosen_workspace.title,
        chosen_workspace.description,
        chosen_workspace.visibility as WorkspaceVisibility,
        chosen_workspace.owner_id,
        workspace_id,
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

pub async fn get_workspace_nodes(
    State(db_pool): State<Pool<Postgres>>,
    Path(workspace_id): Path<Uuid>,
) -> Result<Json<Vec<Node>>, AppError> {
    let _ = get_workspace_by_id(State(db_pool.to_owned()), Path(workspace_id)).await?;

    let result = sqlx::query_as!(
        Node,
        r#"SELECT 
            id,
            type as "type: _",
            x,
            y,
            width,
            height,
            content,
            next_node_id,
            next_node_id_if_false,
            workspace_id
        FROM public.nodes 
        WHERE workspace_id = $1"#,
        workspace_id,
    )
    .fetch_all(&db_pool)
    .await?;

    Ok(Json(result))
}

pub async fn update_workspace_nodes(
    State(db_pool): State<Pool<Postgres>>,
    Path(workspace_id): Path<Uuid>,
    Json(nodes): Json<Vec<Node>>,
) -> Result<Json<Vec<Node>>, AppError> {
    let mut trx = db_pool.begin().await?;

    // It's safe to delete all nodes because there's no way the client
    // will submit a partial list of the nodes in the workspace, it's always
    // gonne be the full list of nodes of a particular workspace.
    sqlx::query!(
        r#"DELETE FROM public.nodes WHERE workspace_id = $1"#,
        workspace_id
    )
    .execute(&mut *trx)
    .await?;

    for node in nodes.iter() {
        sqlx::query!(
            r#"
        INSERT INTO public.nodes (
            id,
            type, 
            x, 
            y, 
            width, 
            height, 
            content, 
            next_node_id, 
            next_node_id_if_false, 
            workspace_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    "#,
            node.id,
            node.r#type as NodeType,
            node.x,
            node.y,
            node.width,
            node.height,
            node.content,
            node.next_node_id,
            node.next_node_id_if_false,
            workspace_id
        )
        .execute(&mut *trx)
        .await?;
    }

    trx.commit().await?;
    Ok(Json(nodes))
}
