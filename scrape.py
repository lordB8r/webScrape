from bs4 import BeautifulSoup
from time import sleep
from urllib import request
import random
import json
import re, io, os
import csv

def get_pages(id_list, start_position=1):
    urls = open(id_list, 'r').read()

    array = []
    with open(id_list, 'r') as f:       
        jsonArray = json.loads(f.read())

    x = start_position
    while x < len(jsonArray):
        url_end = jsonArray[str(x)]
        file_name = url_end.split('/')[0]+'.html'
        print("Position: " + str(x) + "; File: " + file_name)
        page_url = "http://example.com/l/" + url_end
        req = request.Request(page_url, None, {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36", "Accept": "*/*"})
        
        f = open(file_name, 'wb')
        with request.urlopen(req) as response:
            f.write(response.read())                   
        sleep(1)
        x = x + 1

    print("Finished downloading")

def process_page(id_list, file_name):
    with open(id_list, 'r') as f:       
        jsonArray = json.loads(f.read())

    x = 1 #start_position

    with open('scraped_leads'+file_name+'.csv', 'w', newline='') as csvfile:
        csvwriter = csv.writer(csvfile, delimiter=',', quotechar = '"', quoting=csv.QUOTE_MINIMAL)

        while x <= len(jsonArray):
            y = jsonArray[""+str(x)+""]
            page = y.split('/')[0]
            #print(page)
            html_page = page+".html"
            x += 1
        
            # process each page
            with io.open(html_page, "r", encoding="utf-8") as my_file:
                my_page = my_file.read()

            soup = BeautifulSoup(my_page, 'lxml')

            #get Title
            soup_title = soup.title
            title = str(soup_title).strip('<title>')
            title = title.strip('</')
            title = title.strip('- Chicago, Illinois Radiology Center')
            
            #get Phone
            soup_phones = soup.find_all(href=re.compile("tel:"))
            phones = []
            for phone in soup_phones:
                temp = phone.get('href').strip('tel:')
                if temp not in phones:
                    phones.append(temp)

            #get Address
            soup_addresses = soup.select("[class~=address]")
            soup_address = soup_addresses[0].select("[class~=dtf-value]")
            list_address = soup_addresses[0].find_all(string=True)
            if len(list_address)>0:
                facility_address = list_address[3]
                facility_citystatezip = list_address[len(list_address)-3]

            csvwriter.writerow([title, (phones[0] if len(phones)>0 else "N/A"), facility_address, facility_citystatezip])

            os.remove(html_page)
    print("Done processing")
