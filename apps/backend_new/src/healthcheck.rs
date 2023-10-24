mod handlers {
    use axum::extract::State;
    use sqlx::{self, Pool, Postgres};
    use uuid::Uuid;

    use crate::types::AppError;

    pub async fn get_health(
        State(connection_pool): State<Pool<Postgres>>,
    ) -> Result<&'static str, AppError> {
        let mut tx = connection_pool.begin().await?;

        sqlx::query!(r#"DELETE FROM public.user WHERE id = $1"#, Uuid::new_v4())
            .execute(&mut *tx)
            .await?;

        tx.rollback().await?;

        Ok("Ready")
    }
}

pub use handlers::*;
