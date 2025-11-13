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
	query := `INSERT INTO menu (title, price, imageURLs, calories, description, createdAt, updatedAt) values ($1, $2, $3, $4, $5, $6, $7) RETURNING id`
	var id int
	err := database.Pool.QueryRow(context.Background(), query, item.Title, item.Price, item.ImageURLs, item.Calories, item.Description, time.Now(), time.Now()).Scan(&id)
	return id, err
}

func GetMenuItemByID(id int) (MenuItem, error) {
	query := `SELECT id, title, price, imageURLs, calories, description, createdAt, updatedAt FROM menu WHERE id = $1`
	var item MenuItem
	err := database.Pool.QueryRow(context.Background(), query, id).Scan(
		&item.ID, &item.Title, &item.Price, &item.ImageURLs, &item.Calories, &item.Description, &item.CreatedAt, &item.UpdatedAt,
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
	query := `SELECT id, title, price, imageURLs, calories, description, createdAt, updatedAt FROM menu`
	rows, err := database.Pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var menu []MenuItem
	for rows.Next() {
		var item MenuItem
		err := rows.Scan(&item.ID, &item.Title, &item.Price, &item.ImageURLs, &item.Calories, &item.Description, &item.CreatedAt, &item.UpdatedAt)
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
	query := `UPDATE menu SET title = $1, price = $2, imageURLs = $3, calories = $4, description = $5, updatedAt = NOW() WHERE id = $6`
	result, err := database.Pool.Exec(context.Background(), query, item.Title, item.Price, item.ImageURLs, item.Calories, item.Description, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return ErrMenuItemNotFound
	}
	return nil
}
