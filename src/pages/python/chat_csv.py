#%%
#!/usr/bin/env python

import subprocess
import sys
def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# install("matplotlib")
# install("numpy")
# install("pandas")
# install("seaborn")
# install("wordcloud")

import matplotlib.pyplot as plt
from matplotlib.dates import DateFormatter
import numpy as np
from pandas import read_csv, DataFrame
import pandas as pd, numpy as np
import seaborn as sns
from wordcloud import WordCloud, STOPWORDS
import json

import csv, os
from datetime import datetime
from os.path import dirname, join

current_dir = dirname(__file__)
file_path = join(current_dir, "./chatlog.txt")
chatlog = open(file_path, errors='ignore')
file_path = join(current_dir, "./sorted.csv")
sorted = open(file_path, 'w', newline='')
chatwriter = csv.writer(sorted, delimiter=',', quoting=csv.QUOTE_ALL)
chatwriter.writerow(['datetime', 'user', 'msg', 'msgLen', 'q'])
tempStr = 'test'
while tempStr != '':
    tempStr = chatlog.readline()
    valid = True; msgLen,i = 0,0; m = 9999
    dateStr,timeStr,userStr,msgStr='','','',''
    if 19 > len(tempStr): valid = False
    for c in tempStr:
        if i < 10: dateStr += c
        if i == 10:
            try:
                day,month,year = dateStr.split('/')
                datetime(int(year),int(month),int(day))
            except ValueError: valid = False
            if valid is False: break
        if 11 < i < 17: timeStr += c
        if 19 < i < m:
            if c == ':': m = i+1
            else: userStr += c
        if i > m:
            if c != '\n': msgStr += c
        i += 1
    if valid is False: continue
    for c in msgStr: msgLen += 1
    dt = datetime.strptime(dateStr + ' ' + timeStr, '%d/%m/%Y %H:%M')
    datetimeStr = dt.strftime('%Y-%m-%d %H:%M')
    chatwriter.writerow([datetimeStr,userStr,msgStr,msgLen,'1'])
sorted.close()
chatlog.close()

#######################
#        PLOTS        #
#######################

file_path = join(current_dir, "./sorted.csv")
series = read_csv(file_path, header=0, parse_dates=[0], index_col=0, usecols=[0,1,2], squeeze=True, encoding="latin-1")
df = DataFrame(series)

# DAILY COUNT
df_counts = df.resample('D').count()

# fig, ax = plt.subplots()
# ax.plot(df_counts)
# ax.set(title = "Messages with Santiago", ylabel = "Ammount of messages\nPeriod: [1 day]")

# date_form = DateFormatter("%Y-%b")
# ax.xaxis.set_major_formatter(date_form)

# plt.setp(ax.get_xticklabels(), rotation = 70)

# WHISKERS WEEKDAYS
df_daily = df.resample("D").count()
df_daily['weekday'] = df_daily.index.day_name()
df_daily['day'] = df_daily.index
df_daily = df_daily.pivot(index='day', columns='weekday', values='user')
df_daily = df_daily[['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', ]]
print(df_daily)

# WHISKERS HOURLY
df_hourly = df.resample("H").count()
df_hourly['hour'] = df_hourly.index.hour
df_hourly['day'] = df_hourly.index
df_hourly_mean = df_hourly.groupby(['hour']).mean()
df_hourly = df_hourly.pivot(index='day', columns='hour', values='user')
print(df_hourly)
# WORDS
comment_words = '' 
stopwords = set(STOPWORDS)
file_path = join(current_dir, "./blocked_words.json")
with open(file_path) as f:
  blocked = json.load(f)
for var in blocked["words"]:
    stopwords.add(var)  

for val in df.msg:
    val = str(val)
    tokens = val.split()
    for i in range(len(tokens)): 
        tokens[i] = tokens[i].lower() 
    comment_words += " ".join(tokens)+" "

wordcloud = WordCloud(width = 1500, height = 1000, 
                background_color ='white', 
                stopwords = stopwords, 
                min_font_size = 10).generate(comment_words) 
  
# plot the WordCloud image                        
plt.figure(figsize = (8, 8), facecolor = None) 
plt.imshow(wordcloud) 
plt.axis("off") 
plt.tight_layout(pad = 0) 


# RESPONSE DELAY

df['datetime'] = df.index
df['delta'] = (df['datetime'] - df['datetime'].shift()).fillna(pd.Timedelta(seconds=0))
df["delta"] = df['delta'].dt.total_seconds().div(60).astype(int)


# USERS

plt.figure(figsize=[12,5])
plt.plot(df_counts.index, df_counts["user"])
plt.figure(figsize=[7,5])
df_daily.boxplot(showfliers=False)
plt.figure(figsize=[12, 5])
plt.bar(width=0.75, x=df_hourly_mean.index+1, height=df_hourly_mean["user"], alpha=0.3)
df_hourly.boxplot(showfliers=False)

plt.figure(figsize=[12, 5])
df_users = df.groupby(["user"])
width=0.7
for i, group in enumerate(df_users.groups):
    df_user = df_users.get_group(group)
    df_user = df_user.resample("H").count()
    df_user['hour'] = df_user.index.hour
    df_user['day'] = df_user.index
    df_user_mean = df_user.groupby(['hour']).mean()
    df_user = df_user.pivot(index='day', columns='hour', values='user')
    plt.bar(width=width/df_users.ngroups, x=df_user_mean.index - width/2 + i/df_users.ngroups*width, height=df_user_mean["user"], align="edge")


bins = [0, 1, 2, 5, 10, 30, 60, 120, 180]
names = ['0-1', "1-2", '2-5', "5-10", "10-30", "30-60", "60-120", "120-180", "180+"]
tags = ["180+", "120-180", "60-120", "30-60", "10-30", "5-10", '2-5', "1-2", '0-1']
d = dict(enumerate(names, 1))
df_delta = df
df_delta["hour"] = df_delta.index.hour
df_delta["hour"] = df_delta["hour"].shift(1)
df_delta = df_delta.drop(['msg', 'datetime'], axis=1)
df_delta = df_delta.loc[df_delta["user"].shift(1) != df_delta["user"]]
df_delta['delta_rnd'] = np.vectorize(d.get)(np.digitize(df_delta['delta'], bins))
df_delta = df_delta.groupby(["user"])
width=0.7
for i, group in enumerate(df_delta.groups):
    df_user = df_delta.get_group(group)
    df_user['count'] = 1
    df2 = df_user.groupby(['delta_rnd','hour'], as_index=False).count()
    df_p = pd.pivot_table(df2, 'count', 'delta_rnd', 'hour')
    df_p = df_p.reindex(index=tags)
    plt.figure(figsize=[12, 5])
    sns.heatmap(df_p, cmap="pink")

plt.show()
print(df)
exit
#%%