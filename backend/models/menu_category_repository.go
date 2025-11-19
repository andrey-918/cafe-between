package models

import (
	"context"
	"errors"

	"github.com/andrey-918/cafe-between/internal/database"
	"github.com/jackc/pgx/v5"
)

var ErrMenuCategoryNotFound = errors.New("menu category not found")

func CreateMenuCategory(nameRu, nameEn string) (int, error) {
	// Check if category already exists by name_ru
	query := `SELECT id FROM menu_categories WHERE name_ru = $1`
	var id int
	err := database.Pool.QueryRow(context.Background(), query, nameRu).Scan(&id)
	if err != nil {
		if err == pgx.ErrNoRows {
			// Get the next sort_order
			var maxSortOrder int
			query = `SELECT COALESCE(MAX(sort_order), 0) FROM menu_categories`
			err = database.Pool.QueryRow(context.Background(), query).Scan(&maxSortOrder)
			if err != nil {
				return 0, err
			}
			// Category does not exist, insert it
			query = `INSERT INTO menu_categories (name_ru, name_en, sort_order) VALUES ($1, $2, $3) RETURNING id`
			err = database.Pool.QueryRow(context.Background(), query, nameRu, nameEn, maxSortOrder+1).Scan(&id)
			if err != nil {
				return 0, err
			}
		} else {
			return 0, err
		}
	}
	return id, nil
}

func GetMenuCategories() ([]MenuCategory, error) {
	query := `SELECT id, name_ru, name_en, sort_order, createdAt FROM menu_categories ORDER BY sort_order, name_ru`
	rows, err := database.Pool.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var categories []MenuCategory
	for rows.Next() {
		var cat MenuCategory
		err := rows.Scan(&cat.ID, &cat.NameRu, &cat.NameEn, &cat.SortOrder, &cat.CreatedAt)
		if err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}
	return categories, nil
}

func GetMenuCategoryByNameRu(nameRu string) (MenuCategory, error) {
	query := `SELECT id, name_ru, name_en, sort_order, createdAt FROM menu_categories WHERE name_ru = $1`
	var cat MenuCategory
	err := database.Pool.QueryRow(context.Background(), query, nameRu).Scan(&cat.ID, &cat.NameRu, &cat.NameEn, &cat.SortOrder, &cat.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return MenuCategory{}, ErrMenuCategoryNotFound
		}
		return MenuCategory{}, err
	}
	return cat, nil
}

func DeleteUnusedMenuCategory(nameEn string) error {
	// Check if any menu items use this category
	query := `SELECT COUNT(*) FROM menu WHERE category = $1`
	var count int
	err := database.Pool.QueryRow(context.Background(), query, nameEn).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil // Still used
	}
	// Delete the category
	query = `DELETE FROM menu_categories WHERE name_en = $1`
	_, err = database.Pool.Exec(context.Background(), query, nameEn)
	return err
}

func UpdateMenuCategorySortOrder(id int, sortOrder int) error {
	query := `UPDATE menu_categories SET sort_order = $1 WHERE id = $2`
	_, err := database.Pool.Exec(context.Background(), query, sortOrder, id)
	return err
}

func GetMenuCategoryByID(id int) (MenuCategory, error) {
	query := `SELECT id, name_ru, name_en, sort_order, createdAt FROM menu_categories WHERE id = $1`
	var cat MenuCategory
	err := database.Pool.QueryRow(context.Background(), query, id).Scan(&cat.ID, &cat.NameRu, &cat.NameEn, &cat.SortOrder, &cat.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return MenuCategory{}, ErrMenuCategoryNotFound
		}
		return MenuCategory{}, err
	}
	return cat, nil
}

func DeleteMenuCategoryByID(id int) error {
	query := `DELETE FROM menu_categories WHERE id = $1`
	_, err := database.Pool.Exec(context.Background(), query, id)
	return err
}
