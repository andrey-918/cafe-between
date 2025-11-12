package models

import "time"

type MenuItem struct {
	ID 			int 		`json:"id"`
	Title 		string 		`json:"title"`
	Price 		int			`json:"price"`
	ImageURLs 	[]string 	`json:"imageURLs"`
	Calories 	int 		`json:"calories,omitempty"`
	Description string		`json:"description,omitempty"`
	CreatedAt	time.Time	`json:"createdAt"`
}