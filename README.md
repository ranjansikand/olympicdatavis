# olympicdatavis
Visualization depicting data from every Olympics games from 1896 to today.

Data can be found at https://www.kaggle.com/heesoo37/120-years-of-olympic-history-athletes-and-results. To run this code successfully, it should be downloaded into a file called 'data' in the home directory. The file is slightly over 40MB, which is over the allowed limit from GitHub.

The visualization system is broken into three distinct pieces. 
The central plot is a simple barplot that depicts over 65 countries with the highest number of Olympic Athletes. This is accompanied by a multi-level pie chart that shows a breakdown of medal winnings, and a radial chart that shows the sports from each country with the highest number of competing athletes. Unsurprisingly, Track and Field (athletics) routinely finishes in the top 3.

The radial chart is based on an implementation from Bl.ocks by Anton Orlov.
