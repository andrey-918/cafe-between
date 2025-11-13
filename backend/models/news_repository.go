package models

import (
	"context"
	"errors"
	"time"

	"github.com/andrey-918/cafe-between/internal/database"
	"github.com/jackc/pgx/v5"
)

var ErrNewsNotFound = errors.New("News item not found")

func CreateNews(item News) (int, error) {
	query := `INSERT INTO news (title, description, imageURLs, createdAt, updatedAt, postedAt) values ($1, $2, $3, $4, $5, $6) RETURNING id`
	var id int
	err := database.Pool.QueryRow(context.Background(), query, item.Title, item.Description, item.ImageURLs, time.Now(), time.Now(), item.PostedAt).Scan(&id)
	return id, err
}

func GetNewsByID(id int) (News, error) {
	query := `SELECT id, title, description, imageURLs, createdAt, updatedAt, postedAt FROM news WHERE id = $1`
	var item News
	err := database.Pool.QueryRow(context.Background(), query, id).Scan(
        &item.ID, &item.Title, &item.Description, &item.ImageURLs, &item.CreatedAt, &item.UpdatedAt, &item.PostedAt,
    )
	if err != nil {
        if err == pgx.ErrNoRows {
            return News{}, ErrNewsNotFound
        }
        return News{}, err
    }
    return item, nil
}

func GetNews() ([]News, error) {
	query := `SELECT id, title, description, imageURLs, createdAt, updatedAt, postedAt FROM news`
	rows, err := database.Pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var news []News
	for rows.Next() {
		var item News
		err := rows.Scan(&item.ID, &item.Title, &item.Description, &item.ImageURLs, &item.CreatedAt, &item.UpdatedAt, &item.PostedAt)
		if err != nil {
			return nil, err
		}
		news = append(news, item)
	}
	return news, nil
}

func DelNews(id int) error {
	query := `DELETE FROM news WHERE id = $1`
	result, err := database.Pool.Exec(context.Background(), query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrNewsNotFound
	}
	return nil
}

func UpdateNews(id int, item News) error {
	query := `UPDATE news SET title = $1, description = $2, imageURLs = $3, createdAt = $4, updatedAt = NOW(), postedAt = $5 WHERE id = $6`
	result, err := database.Pool.Exec(context.Background(), query, item.Title, item.Description, item.ImageURLs, item.CreatedAt, item.PostedAt, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return ErrNewsNotFound
	}
	return nil
}