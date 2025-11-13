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

func setupTestDBNews(t *testing.T) *pgxpool.Pool {
	_ = godotenv.Load("../../.env")
	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		dsn = "host=localhost port=5432 user=postgres password=secretPass dbname=cafe-between sslmode=disable timezone=Europe/Moscow"
	}
	pool, err := pgxpool.New(context.Background(), dsn)
	require.NoError(t, err)
	require.NoError(t, pool.Ping(context.Background()))
	return pool
}

func TestCreateNews(t *testing.T) {
	pool := setupTestDBNews(t)
	defer pool.Close()

	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	postedAt := time.Now().Add(24 * time.Hour).UTC() // Future date
	item := models.News{
		Title:       "Test news",
		Description: "A test news item",
		ImageURLs:   []string{"http://example.com/news.jpg"},
		PostedAt:    postedAt,
	}

	id, err := models.CreateNews(item)
	assert.NoError(t, err)
	assert.Greater(t, id, 0)

	// Verify the item was created
	retrieved, err := models.GetNewsByID(id)
	assert.NoError(t, err)
	assert.Equal(t, item.Title, retrieved.Title)
	assert.Equal(t, item.Description, retrieved.Description)
	assert.Equal(t, item.PostedAt.UTC().Format(time.RFC3339), retrieved.PostedAt.UTC().Format(time.RFC3339))
	assert.NotZero(t, retrieved.CreatedAt)
	assert.NotZero(t, retrieved.UpdatedAt)
}

func TestGetNewsByID(t *testing.T) {
	pool := setupTestDBNews(t)
	defer pool.Close()

	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	// Create a test item first
	postedAt := time.Now().Add(24 * time.Hour)
	item := models.News{
		Title:       "Test news",
		Description: "A test news item",
		ImageURLs:   []string{"http://example.com/news.jpg"},
		PostedAt:    postedAt,
	}

	id, err := models.CreateNews(item)
	require.NoError(t, err)

	retrieved, err := models.GetNewsByID(id)
	assert.NoError(t, err)
	assert.Equal(t, id, retrieved.ID)
	assert.Equal(t, item.Title, retrieved.Title)

	// Test non-existent item
	_, err = models.GetNewsByID(99999)
	assert.Equal(t, models.ErrNewsNotFound, err)
}

func TestGetNews(t *testing.T) {
	pool := setupTestDBNews(t)
	defer pool.Close()

	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	// Clear existing items
	_, _ = pool.Exec(context.Background(), "DELETE FROM news")

	// Create test items
	postedAt1 := time.Now().Add(24 * time.Hour).UTC()
	postedAt2 := time.Now().Add(48 * time.Hour).UTC()
	items := []models.News{
		{Title: "news 1", Description: "Desc 1", ImageURLs: []string{"url1"}, PostedAt: postedAt1},
		{Title: "news 2", Description: "Desc 2", ImageURLs: []string{"url2"}, PostedAt: postedAt2},
	}

	for _, item := range items {
		_, err := models.CreateNews(item)
		require.NoError(t, err)
	}

	news, err := models.GetNews()
	assert.NoError(t, err)
	assert.Len(t, news, 2)
	assert.Equal(t, "news 1", news[0].Title)
	assert.Equal(t, "news 2", news[1].Title)
}

func TestUpdateNews(t *testing.T) {
	pool := setupTestDBNews(t)
	defer pool.Close()

	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	// Create a test item
	postedAt := time.Now().Add(24 * time.Hour).UTC()
	item := models.News{
		Title:       "Original news",
		Description: "Original description",
		ImageURLs:   []string{"http://example.com/news.jpg"},
		PostedAt:    postedAt,
	}

	id, err := models.CreateNews(item)
	require.NoError(t, err)

	// Store original createdAt and updatedAt
	original, err := models.GetNewsByID(id)
	require.NoError(t, err)
	originalCreatedAt := original.CreatedAt
	originalUpdatedAt := original.UpdatedAt

	// Wait a bit to ensure updatedAt will be different
	time.Sleep(10 * time.Millisecond)

	// Update the item
	newPostedAt := time.Now().Add(72 * time.Hour).UTC()
	updatedItem := models.News{
		Title:       "Updated News",
		Description: "Updated description",
		ImageURLs:   []string{"http://example.com/updated_news.jpg"},
		PostedAt:    newPostedAt,
	}

	err = models.UpdateNews(id, updatedItem)
	assert.NoError(t, err)

	// Verify the update
	retrieved, err := models.GetNewsByID(id)
	assert.NoError(t, err)
	assert.Equal(t, "Updated News", retrieved.Title)
	assert.Equal(t, "Updated description", retrieved.Description)
	assert.Equal(t, newPostedAt.UTC().Format(time.RFC3339), retrieved.PostedAt.UTC().Format(time.RFC3339))
	assert.Equal(t, originalCreatedAt, retrieved.CreatedAt) // createdAt should not change
	assert.True(t, retrieved.UpdatedAt.After(originalUpdatedAt), "updatedAt should be after original: %v vs %v", retrieved.UpdatedAt, originalUpdatedAt)
}

func TestDelNews(t *testing.T) {
	pool := setupTestDBNews(t)
	defer pool.Close()

	originalPool := database.Pool
	database.Pool = pool
	defer func() { database.Pool = originalPool }()

	// Create a test item
	postedAt := time.Now().Add(24 * time.Hour).UTC()
	item := models.News{
		Title:       "News to Delete",
		Description: "Will be deleted",
		ImageURLs:   []string{"http://example.com/models.News.jpg"},
		PostedAt:    postedAt,
	}

	id, err := models.CreateNews(item)
	require.NoError(t, err)

	// Delete the item
	err = models.DelNews(id)
	assert.NoError(t, err)

	// Verify it's deleted
	_, err = models.GetNewsByID(id)
	assert.Equal(t, models.ErrNewsNotFound, err)

	// Test deleting non-existent item
	err = models.DelNews(99999)
	assert.Equal(t, models.ErrNewsNotFound, err)
}
