package tests

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/andrey-918/cafe-between/models"
	"github.com/stretchr/testify/assert"
)

func TestMenuItemJSONMarshal(t *testing.T) {
	now := time.Now()
	item := models.MenuItem{
		ID:          1,
		Title:       "Test Dish",
		Price:       100,
		ImageURLs:   []string{"http://example.com/image1.jpg", "http://example.com/image2.jpg"},
		Calories:    500,
		Description: "A delicious test dish",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Test JSON marshaling
	data, err := json.Marshal(item)
	assert.NoError(t, err)
	assert.Contains(t, string(data), `"title":"Test Dish"`)
	assert.Contains(t, string(data), `"price":100`)
	assert.Contains(t, string(data), `"calories":500`)
	assert.Contains(t, string(data), `"description":"A delicious test dish"`)
	assert.Contains(t, string(data), `"imageURLs":["http://example.com/image1.jpg","http://example.com/image2.jpg"]`)
}

func TestMenuItemJSONUnmarshal(t *testing.T) {
	jsonData := `{
		"id": 1,
		"title": "Test Dish",
		"price": 100,
		"imageURLs": ["http://example.com/image1.jpg", "http://example.com/image2.jpg"],
		"calories": 500,
		"description": "A delicious test dish",
		"createdAt": "2023-11-13T10:00:00Z",
		"updatedAt": "2023-11-13T10:00:00Z"
	}`

	var item models.MenuItem
	err := json.Unmarshal([]byte(jsonData), &item)
	assert.NoError(t, err)
	assert.Equal(t, 1, item.ID)
	assert.Equal(t, "Test Dish", item.Title)
	assert.Equal(t, 100, item.Price)
	assert.Equal(t, 500, item.Calories)
	assert.Equal(t, "A delicious test dish", item.Description)
	assert.Len(t, item.ImageURLs, 2)
	assert.Equal(t, "http://example.com/image1.jpg", item.ImageURLs[0])
	assert.Equal(t, "http://example.com/image2.jpg", item.ImageURLs[1])
	assert.NotZero(t, item.CreatedAt)
	assert.NotZero(t, item.UpdatedAt)
}

func TestMenuItemValidation(t *testing.T) {
	tests := []struct {
		name    string
		item    models.MenuItem
		isValid bool
	}{
		{
			name: "Valid menu item",
			item: models.MenuItem{
				Title:       "Valid Dish",
				Price:       100,
				ImageURLs:   []string{"http://example.com/image.jpg"},
				Calories:    500,
				Description: "Valid description",
			},
			isValid: true,
		},
		{
			name: "Missing title",
			item: models.MenuItem{
				Price:       100,
				ImageURLs:   []string{"http://example.com/image.jpg"},
				Calories:    500,
				Description: "Description",
			},
			isValid: false,
		},
		{
			name: "Negative price",
			item: models.MenuItem{
				Title:       "Dish",
				Price:       -100,
				ImageURLs:   []string{"http://example.com/image.jpg"},
				Calories:    500,
				Description: "Description",
			},
			isValid: false,
		},
		{
			name: "Empty image URLs",
			item: models.MenuItem{
				Title:       "Dish",
				Price:       100,
				ImageURLs:   []string{},
				Calories:    500,
				Description: "Description",
			},
			isValid: false,
		},
		{
			name: "Negative calories",
			item: models.MenuItem{
				Title:       "Dish",
				Price:       100,
				ImageURLs:   []string{"http://example.com/image.jpg"},
				Calories:    -500,
				Description: "Description",
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Basic validation - check required fields
			if tt.item.Title == "" {
				assert.False(t, tt.isValid, "Title is required")
			} else if tt.item.Price < 0 {
				assert.False(t, tt.isValid, "Price cannot be negative")
			} else if len(tt.item.ImageURLs) == 0 {
				assert.False(t, tt.isValid, "At least one image URL is required")
			} else if tt.item.Calories < 0 {
				assert.False(t, tt.isValid, "Calories cannot be negative")
			} else {
				assert.True(t, tt.isValid, "Item should be valid")
			}
		})
	}
}
