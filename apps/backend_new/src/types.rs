use axum::{http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use sqlx::types::chrono;

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
            return (
                StatusCode::BAD_REQUEST,
                "invalid parameter, expects uuid, given plain string",
            )
                .into_response();
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
    pub id: String,
    pub full_name: String,
    pub email: String,
    pub password: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}
