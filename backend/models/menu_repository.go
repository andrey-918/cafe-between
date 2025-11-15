package models

import (
	"context"
	"errors"
	"time"

	"github.com/andrey-918/cafe-between/internal/database"
	"github.com/jackc/pgx/v5"
)

var ErrMenuItemNotFound = errors.New("menu item not found")

func CreateMenuItem(item MenuItem) (int, error) {
	query := `INSERT INTO menu (title, price, imageURLs, calories, description, category, createdAt, updatedAt) values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`
	var id int
	now := time.Now().UTC().Add(3 * time.Hour) // UTC+3 for Moscow
	err := database.Pool.QueryRow(context.Background(), query, item.Title, item.Price, item.ImageURLs, item.Category, item.Calories, item.Description, now, now).Scan(&id)
	return id, err
}

func GetMenuItemByID(id int) (MenuItem, error) {
	query := `SELECT id, title, price, imageURLs, calories, description, category, createdAt, updatedAt FROM menu WHERE id = $1`
	var item MenuItem
	err := database.Pool.QueryRow(context.Background(), query, id).Scan(
		&item.ID, &item.Title, &item.Price, &item.ImageURLs, &item.Calories, &item.Description, &item.Category, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return MenuItem{}, ErrMenuItemNotFound
		}
		return MenuItem{}, err
	}
	return item, nil
}

func GetMenu() ([]MenuItem, error) {
	query := `SELECT id, title, price, imageURLs, calories, description, category, createdAt, updatedAt FROM menu`
	rows, err := database.Pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var menu []MenuItem
	for rows.Next() {
		var item MenuItem
		err := rows.Scan(&item.ID, &item.Title, &item.Price, &item.ImageURLs, &item.Calories, &item.Description, &item.Category, &item.CreatedAt, &item.UpdatedAt)
		if err != nil {
			return nil, err
		}
		menu = append(menu, item)
	}
	return menu, nil
}

func DelMenuItem(id int) error {
	query := `DELETE FROM menu WHERE id = $1`
	result, err := database.Pool.Exec(context.Background(), query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrMenuItemNotFound
	}
	return nil
}

func UpdateMenuItem(id int, item MenuItem) error {
	query := `UPDATE menu SET title = $1, price = $2, imageURLs = $3, calories = $4, description = $5, category = $6, updatedAt = NOW() + INTERVAL '3 hours' WHERE id = $7`
	result, err := database.Pool.Exec(context.Background(), query, item.Title, item.Price, item.ImageURLs, item.Calories, item.Description, item.Category, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return ErrMenuItemNotFound
	}
	return nil
}
