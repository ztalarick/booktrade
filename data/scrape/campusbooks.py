# this script is to scrape textbook data from campusbooks.com to seed the database
# Eventually rewrite the scraper so its faster
# maybe with a different library like Scrapy not beatiful soup

# something strange i noticed, amazon updates their prices everytime the script runs
# possibility of manipulating the textbook price on amazon

import requests
from bs4 import BeautifulSoup
import sys
import json

r = requests.get("https://www.campusbooks.com/search/" + sys.argv[1] + "?buysellrent=buy")
soup = BeautifulSoup(r.text, "html.parser")


# Class (col-xs-8 col-sm-12 div-o) has the info We need
# change to "col-xs-8 col-sm-12 hidden-xs" ??
# I suppose this is an unreliable method because the class already changed to this for some reason
info = soup.find('div', {"class": "col-xs-8 col-sm-12 hidden-xs"})


#get all keys for json object
keys = []
for tag in info.findAll('strong'):
    keys += [tag.get_text().replace(" ", "")]

#get all valyes for json object
values = []
for tag in info.findAll('dt'):
    values += [tag.get_text().split(': ')[-1]]

#build json object to export to nodeJS app
data = {
    "title": soup.find('strong', {"class": "title-book"}).string
}

for i in range(len(keys)):
    data[keys[i]] = values[i]

clean_prices = []
prices = soup.findAll('td', {"class": "price hidden-xs"}) #get all the prices
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

data["used_price"] = price_data["Used"]
data["new_price"] = price_data["New"]

final_data = json.dumps(data)
print(final_data)
sys.stdout.flush()

#TODO sometimes this doesn't work at all. figure that out and fix it
