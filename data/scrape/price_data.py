#this script is to scrape textbook data and spit it into a CSV file

import requests
from bs4 import BeautifulSoup
import json
import csv

#use ISBN_13
ISBN_LIST = ["9780133591620", "9780321637734"]

with open('price_data.csv', 'w', newline='') as csvfile:
    fieldnames = ['isbn', 'title', 'new_price', 'used_price']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()

    for isbn in ISBN_LIST:
        r = requests.get("https://www.campusbooks.com/search/" + isbn + "?buysellrent=buy")
        soup = BeautifulSoup(r.text, "html.parser")
        clean_prices = []
        prices = soup.findAll('td', {"class": "price hidden-xs"}) #get all the prices
        print(prices)
        for price in prices:
            clean_prices += [price.get_text().replace(" ", "").replace("\n", "")]

        clean_conditions = []
        conditions = soup.findAll('td', {"class": "condition"}) #get all the conditions
        for condition in conditions:
            clean_conditions += [condition.get_text().replace(" ", "").replace("\n", "")]


        price_data = { }

        for j in range(len(clean_conditions)): #get the best prices for each condition
            if clean_conditions[j] in price_data: #if the dict has a condition
                if price_data[clean_conditions[j]] > clean_prices[j]: #if curr price > new price
                    price_data[clean_conditions[j]] = clean_prices[j] #update it
            else: #otherwise make an initial price
                price_data[clean_conditions[j]] = clean_prices[j]

        data = {
            "title": soup.find('strong', {"class": "title-book"}).string,
            "isbn": isbn
        }

        data["used_price"] = price_data["Used"]
        data["new_price"] = price_data["New"]


        writer.writerow(data)
