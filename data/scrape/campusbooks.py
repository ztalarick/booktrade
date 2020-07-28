# this script is to scrape textbook data from campusbooks.com to seed the database
# Eventually rewrite the scraper so its faster
# maybe with a different library like Scrapy not beatiful soup
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

final_data = json.dumps(data)
print(final_data)
sys.stdout.flush()

#TODO scrape prices also
# prices = soup.findAll('td', {"class": "total"})
# # prices = soup.findAll('tbody')
# print(prices)
