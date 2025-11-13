package tests

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/andrey-918/cafe-between/internal/database"
	"github.com/andrey-918/cafe-between/models"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestDB(t *testing.T) *pgxpool.Pool {
	_ = godotenv.Load("../../.env")
	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		dsn = "host=localhost port=5432 user=postgres dbname=cafe-between sslmode=disable timezone=Europe/Moscow"
	}
	pool, err := pgxpool.New(context.Background(), dsn)
	require.NoError(t, err)
	require.NoError(t, pool.Ping(context.Background()))
	return pool
}

func TestCreateMenuItem(t *testing.T) {
	pool := setupTestDB(t)
	defer pool.Close()

	// Override the global pool for testing
	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	item := models.MenuItem{
		Title:       "Test Dish",
		Price:       100,
		ImageURLs:   []string{"http://example.com/image.jpg"},
		Calories:    500,
		Description: "A test dish",
	}

	id, err := models.CreateMenuItem(item)
	assert.NoError(t, err)
	assert.Greater(t, id, 0)

	// Verify the item was created
	retrieved, err := models.GetMenuItemByID(id)
	assert.NoError(t, err)
	assert.Equal(t, item.Title, retrieved.Title)
	assert.Equal(t, item.Price, retrieved.Price)
	assert.NotZero(t, retrieved.CreatedAt)
	assert.NotZero(t, retrieved.UpdatedAt)
}

func TestGetMenuItemByID(t *testing.T) {
	pool := setupTestDB(t)
	defer pool.Close()

	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	// Create a test item first
	item := models.MenuItem{
		Title:       "Test Dish",
		Price:       100,
		ImageURLs:   []string{"http://example.com/image.jpg"},
		Calories:    500,
		Description: "A test dish",
	}

	id, err := models.CreateMenuItem(item)
	require.NoError(t, err)

	retrieved, err := models.GetMenuItemByID(id)
	assert.NoError(t, err)
	assert.Equal(t, id, retrieved.ID)
	assert.Equal(t, item.Title, retrieved.Title)

	// Test non-existent item
	_, err = models.GetMenuItemByID(99999)
	assert.Equal(t, models.ErrMenuItemNotFound, err)
}

func TestGetMenu(t *testing.T) {
	pool := setupTestDB(t)
	defer pool.Close()

	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	// Clear existing items
	_, _ = pool.Exec(context.Background(), "DELETE FROM menu")

	// Create test items
	items := []models.MenuItem{
		{Title: "Dish 1", Price: 100, ImageURLs: []string{"url1"}, Calories: 200, Description: "Desc 1"},
		{Title: "Dish 2", Price: 200, ImageURLs: []string{"url2"}, Calories: 300, Description: "Desc 2"},
	}

	for _, item := range items {
		_, err := models.CreateMenuItem(item)
		require.NoError(t, err)
	}

	menu, err := models.GetMenu()
	assert.NoError(t, err)
	assert.Len(t, menu, 2)
	assert.Equal(t, "Dish 1", menu[0].Title)
	assert.Equal(t, "Dish 2", menu[1].Title)
}

func TestUpdateMenuItem(t *testing.T) {
	pool := setupTestDB(t)
	defer pool.Close()

	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	// Create a test item
	item := models.MenuItem{
		Title:       "Original Dish",
		Price:       100,
		ImageURLs:   []string{"http://example.com/image.jpg"},
		Calories:    500,
		Description: "Original description",
	}

	id, err := models.CreateMenuItem(item)
	require.NoError(t, err)

	// Store original createdAt and updatedAt
	original, err := models.GetMenuItemByID(id)
	require.NoError(t, err)
	originalCreatedAt := original.CreatedAt
	originalUpdatedAt := original.UpdatedAt

	// Wait a bit to ensure updatedAt will be different
	time.Sleep(10 * time.Millisecond)

	// Update the item
	updatedItem := models.MenuItem{
		Title:       "Updated Dish",
		Price:       150,
		ImageURLs:   []string{"http://example.com/updated.jpg"},
		Calories:    600,
		Description: "Updated description",
	}

	err = models.UpdateMenuItem(id, updatedItem)
	assert.NoError(t, err)

	// Verify the update
	retrieved, err := models.GetMenuItemByID(id)
	assert.NoError(t, err)
	assert.Equal(t, "Updated Dish", retrieved.Title)
	assert.Equal(t, 150, retrieved.Price)
	assert.Equal(t, 600, retrieved.Calories)
	assert.Equal(t, "Updated description", retrieved.Description)
	assert.Equal(t, originalCreatedAt, retrieved.CreatedAt) // createdAt should not change
	assert.True(t, retrieved.UpdatedAt.After(originalUpdatedAt), "updatedAt should be after original: %v vs %v", retrieved.UpdatedAt, originalUpdatedAt)
}

func TestDelMenuItem(t *testing.T) {
	pool := setupTestDB(t)
	defer pool.Close()

	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	// Create a test item
	item := models.MenuItem{
		Title:       "Dish to Delete",
		Price:       100,
		ImageURLs:   []string{"http://example.com/image.jpg"},
		Calories:    500,
		Description: "Will be deleted",
	}

	id, err := models.CreateMenuItem(item)
	require.NoError(t, err)

	// Delete the item
	err = models.DelMenuItem(id)
	assert.NoError(t, err)

	// Verify it's deleted
	_, err = models.GetMenuItemByID(id)
	assert.Equal(t, models.ErrMenuItemNotFound, err)

	// Test deleting non-existent item
	err = models.DelMenuItem(99999)
	assert.Equal(t, models.ErrMenuItemNotFound, err)
}
