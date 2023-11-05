use axum::{http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use sqlx::types::chrono;
use uuid::Uuid;

pub struct AppError(anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        if let Some(sqlx_error) = self.0.downcast_ref::<sqlx::Error>() {
            match sqlx_error {
                sqlx::Error::RowNotFound => {
                    return (StatusCode::NOT_FOUND, "resource not found").into_response()
                }
                e => return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
            }
        }

        if let Some(_) = self.0.downcast_ref::<uuid::Error>() {
            return (StatusCode::BAD_REQUEST, "invalid uuid").into_response();
        }

        (StatusCode::INTERNAL_SERVER_ERROR, self.0.to_string()).into_response()
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(value: E) -> Self {
        Self(value.into())
    }
}

#[derive(Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub full_name: String,
    pub email: String,
    pub password: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "workspace_visibility", rename_all = "lowercase")]
pub enum WorkspaceVisibility {
    Public,
    Private,
}

impl From<String> for WorkspaceVisibility {
    fn from(value: String) -> Self {
        match value.as_str() {
            "Public" => Self::Public,
            "Private" => Self::Private,
            _ => Self::Private,
        }
    }
}

#[derive(Serialize, Deserialize, sqlx::FromRow)]
pub struct Workspace {
    pub id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub visibility: WorkspaceVisibility,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
    pub owner_id: Uuid,
}

#[derive(Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "node_type", rename_all = "lowercase")]
pub enum NodeType {
    Start,
    End,
    Process,
    Input,
    Output,
    Loop,
    Condition,
}

impl From<String> for NodeType {
    fn from(value: String) -> Self {
        match value.as_str() {
            "start" => Self::Start,
            "end" => Self::End,
            "process" => Self::Process,
            "input" => Self::Input,
            "output" => Self::Output,
            "loop" => Self::Loop,
            "condition" => Self::Condition,
            _ => panic!("Invalid node type"),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct Node {
    pub id: Uuid,
    pub r#type: NodeType,
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
    pub content: Option<String>,
    pub next_node_id: Option<Uuid>,
    pub next_node_id_if_false: Option<Uuid>,
    pub workspace_id: Uuid,
}

#[derive(Serialize, Deserialize)]
pub struct AuthResponse {
    pub access_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String,
    pub exp: usize,
}
