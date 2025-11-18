package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/andrey-918/cafe-between/models"
	"github.com/gorilla/mux"
	"github.com/patrickmn/go-cache"
)

func CreateMenuItemHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	priceStr := r.FormValue("price")
	caloriesStr := r.FormValue("calories")
	description := r.FormValue("description")
	categoryRu := r.FormValue("category")

	files := r.MultipartForm.File["images"]
	imagePaths, err := SaveUploadedFiles(files)
	if err != nil {
		http.Error(w, "Failed to save images: "+err.Error(), http.StatusBadRequest)
		return
	}

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		http.Error(w, "Invalid price", http.StatusBadRequest)
		return
	}

	calories, err := strconv.Atoi(caloriesStr)
	if err != nil {
		calories = 0
	}

	// Create or get category
	categoryEn := transliterate(categoryRu)
	if categoryRu == "" {
		http.Error(w, "Category is required", http.StatusBadRequest)
		return
	}
	_, err = models.CreateMenuCategory(categoryRu, categoryEn)
	if err != nil {
		http.Error(w, "Failed to create category", http.StatusInternalServerError)
		return
	}

	item := models.MenuItem{
		Title:       title,
		Price:       int(price),
		ImageURLs:   imagePaths,
		Calories:    calories,
		Description: description,
		Category:    categoryEn, // Store English translit in menu table
	}

	id, err := models.CreateMenuItem(item)
	if err != nil {
		http.Error(w, "Failed to create menu item", http.StatusInternalServerError)
		return
	}
	createdMenuItem, err := models.GetMenuItemByID(id)
	if err != nil {
		http.Error(w, "Failed to fetch created menu item", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdMenuItem)
	Cache.Delete("menu")
	Cache.Delete("menu_categories")
}

func GetMenuHandler(w http.ResponseWriter, r *http.Request) {
	if cached, found := Cache.Get("menu"); found {
		menu := cached.([]models.MenuItem)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(menu)
		return
	}
	menu, err := models.GetMenu()
	if err != nil {
		http.Error(w, "Failed to fetch menu", http.StatusInternalServerError)
		return
	}
	Cache.Set("menu", menu, cache.DefaultExpiration)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(menu)
}

func GetMenuItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	item, err := models.GetMenuItemByID(id)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch menu item", http.StatusInternalServerError)
		}
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func DelMenuItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Get the menu item to delete associated images
	item, err := models.GetMenuItemByID(id)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch menu item", http.StatusInternalServerError)
		}
		return
	}

	// Delete associated images
	if err := DeleteUploadedFiles(item.ImageURLs); err != nil {
		http.Error(w, "Failed to delete images", http.StatusInternalServerError)
		return
	}

	err = models.DelMenuItem(id)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to delete menu item", http.StatusInternalServerError)
		}
		return
	}

	// Delete unused category
	err = models.DeleteUnusedMenuCategory(item.Category)
	if err != nil {
		// Log error but don't fail the request
		// http.Error(w, "Failed to delete unused category", http.StatusInternalServerError)
		// return
	}

	Cache.Delete("menu")
	Cache.Delete("menu_categories")
	Cache.Delete("menu_item_" + idStr)
	w.WriteHeader(http.StatusNoContent)
}

func UpdateMenuHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	priceStr := r.FormValue("price")
	caloriesStr := r.FormValue("calories")
	description := r.FormValue("description")
	categoryRu := r.FormValue("category")

	files := r.MultipartForm.File["images"]
	imagePaths, err := SaveUploadedFiles(files)
	if err != nil {
		http.Error(w, "Failed to save images: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Preserve existing images
	existingImagesStr := r.FormValue("existingImages")
	var existingImages []string
	if existingImagesStr != "" {
		err = json.Unmarshal([]byte(existingImagesStr), &existingImages)
		if err != nil {
			http.Error(w, "Invalid existingImages", http.StatusBadRequest)
			return
		}
	}
	imagePaths = append(existingImages, imagePaths...)

	currentItem, err := models.GetMenuItemByID(id)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch menu item", http.StatusInternalServerError)
		}
		return
	}

	// Find images to delete (those in current but not in new list)
	var imagesToDelete []string
	for _, currentURL := range currentItem.ImageURLs {
		found := false
		for _, newURL := range imagePaths {
			if currentURL == newURL {
				found = true
				break
			}
		}
		if !found {
			imagesToDelete = append(imagesToDelete, currentURL)
		}
	}

	// Delete removed images
	if err := DeleteUploadedFiles(imagesToDelete); err != nil {
		http.Error(w, "Failed to delete old images", http.StatusInternalServerError)
		return
	}

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		http.Error(w, "Invalid price", http.StatusBadRequest)
		return
	}

	calories, err := strconv.Atoi(caloriesStr)
	if err != nil {
		calories = 0
	}

	// Create or get category
	categoryEn := transliterate(categoryRu)
	if categoryRu == "" {
		http.Error(w, "Category is required", http.StatusBadRequest)
		return
	}
	_, err = models.CreateMenuCategory(categoryRu, categoryEn)
	if err != nil {
		http.Error(w, "Failed to create category", http.StatusInternalServerError)
		return
	}

	item := models.MenuItem{
		Title:       title,
		Price:       int(price),
		ImageURLs:   imagePaths,
		Calories:    calories,
		Description: description,
		Category:    categoryEn, // Store English translit in menu table
	}

	err = models.UpdateMenuItem(id, item)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to update menu item", http.StatusInternalServerError)
		}
		return
	}
	Cache.Delete("menu")
	Cache.Delete("menu_categories")
	Cache.Delete("menu_item_" + idStr)
	w.WriteHeader(http.StatusNoContent)
}
