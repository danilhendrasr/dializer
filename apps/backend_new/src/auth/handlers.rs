use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};
use axum::{extract::State, Json};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::Deserialize;
use sqlx::{Pool, Postgres};

use crate::types::{AppError, AuthResponse, JwtClaims, User};

#[derive(Deserialize)]
pub struct LoginPayload {
    pub email: String,
    pub password: String,
}

pub async fn login(
    State(db_pool): State<Pool<Postgres>>,
    Json(payload): Json<LoginPayload>,
) -> Result<String, AppError> {
    Ok("login".to_string())
}

#[derive(Deserialize)]
pub struct RegisterPayload {
    pub full_name: String,
    pub email: String,
    pub password: String,
    pub password_confirmation: String,
}

pub async fn register(
    State(db_pool): State<Pool<Postgres>>,
    Json(payload): Json<RegisterPayload>,
) -> Result<Json<AuthResponse>, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(payload.password.as_bytes(), &salt)?
        .to_string();

    let new_user = sqlx::query_as!(
        User,
        r#"INSERT INTO 
            public.users(full_name, email, password) 
        VALUES
            ($1, $2, $3)
        RETURNING *
        "#,
        payload.full_name,
        payload.email,
        password_hash,
    )
    .fetch_one(&db_pool)
    .await?;

    let jwt_token = encode(
        &Header::default(),
        &JwtClaims {
            sub: new_user.email,
            exp: 10000,
        },
        // TODO: use env variable
        &EncodingKey::from_secret("secret".as_ref()),
    )?;

    Ok(Json(AuthResponse {
        access_token: jwt_token,
    }))
}
