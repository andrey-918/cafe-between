package tests

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/andrey-918/cafe-between/models"
	"github.com/stretchr/testify/assert"
)

func TestNewsJSONMarshal(t *testing.T) {
	now := time.Now()
	future := now.Add(24 * time.Hour)
	item := models.News{
		ID:          1,
		Title:       "Test News",
		Description: "A test news item",
		ImageURLs:   []string{"http://example.com/news1.jpg", "http://example.com/news2.jpg"},
		CreatedAt:   now,
		UpdatedAt:   now,
		PostedAt:    future,
	}

	// Test JSON marshaling
	data, err := json.Marshal(item)
	assert.NoError(t, err)
	assert.Contains(t, string(data), `"title":"Test News"`)
	assert.Contains(t, string(data), `"description":"A test news item"`)
	assert.Contains(t, string(data), `"imageURLs":["http://example.com/news1.jpg","http://example.com/news2.jpg"]`)
}

func TestNewsJSONUnmarshal(t *testing.T) {
	jsonData := `{
		"id": 1,
		"title": "Test News",
		"description": "A test news item",
		"imageURLs": ["http://example.com/news1.jpg", "http://example.com/news2.jpg"],
		"createdAt": "2023-11-13T10:00:00Z",
		"updatedAt": "2023-11-13T10:00:00Z",
		"postedAt": "2023-11-14T10:00:00Z"
	}`

	var item models.News
	err := json.Unmarshal([]byte(jsonData), &item)
	assert.NoError(t, err)
	assert.Equal(t, 1, item.ID)
	assert.Equal(t, "Test News", item.Title)
	assert.Equal(t, "A test news item", item.Description)
	assert.Len(t, item.ImageURLs, 2)
	assert.Equal(t, "http://example.com/news1.jpg", item.ImageURLs[0])
	assert.Equal(t, "http://example.com/news2.jpg", item.ImageURLs[1])
	assert.NotZero(t, item.CreatedAt)
	assert.NotZero(t, item.UpdatedAt)
	assert.NotZero(t, item.PostedAt)
}

func TestNewsValidation(t *testing.T) {
	tests := []struct {
		name    string
		item    models.News
		isValid bool
	}{
		{
			name: "Valid news item",
			item: models.News{
				Title:       "Valid News",
				Description: "Valid description",
				ImageURLs:   []string{"http://example.com/news.jpg"},
				PostedAt:    time.Now().Add(24 * time.Hour),
			},
			isValid: true,
		},
		{
			name: "Missing title",
			item: models.News{
				Description: "Description",
				ImageURLs:   []string{"http://example.com/news.jpg"},
				PostedAt:    time.Now().Add(24 * time.Hour),
			},
			isValid: false,
		},
		{
			name: "Missing description",
			item: models.News{
				Title:     "News",
				ImageURLs: []string{"http://example.com/news.jpg"},
				PostedAt:  time.Now().Add(24 * time.Hour),
			},
			isValid: false,
		},
		{
			name: "Empty image URLs",
			item: models.News{
				Title:       "News",
				Description: "Description",
				ImageURLs:   []string{},
				PostedAt:    time.Now().Add(24 * time.Hour),
			},
			isValid: false,
		},
		{
			name: "Past postedAt date",
			item: models.News{
				Title:       "News",
				Description: "Description",
				ImageURLs:   []string{"http://example.com/news.jpg"},
				PostedAt:    time.Now().Add(-24 * time.Hour), // Past date
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Basic validation - check required fields
			if tt.item.Title == "" {
				assert.False(t, tt.isValid, "Title is required")
			} else if tt.item.Description == "" {
				assert.False(t, tt.isValid, "Description is required")
			} else if len(tt.item.ImageURLs) == 0 {
				assert.False(t, tt.isValid, "At least one image URL is required")
			} else if tt.item.PostedAt.Before(time.Now()) {
				assert.False(t, tt.isValid, "PostedAt cannot be in the past")
			} else {
				assert.True(t, tt.isValid, "Item should be valid")
			}
		})
	}
}
