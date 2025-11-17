package models

import "time"

type MenuCategory struct {
	ID        int       `json:"id"`
	NameRu    string    `json:"name_ru"`
	NameEn    string    `json:"name_en"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"createdAt"`
}
