import numpy as np
import pandas as pd

def users(df):
   df_users = df.groupby(["user"])
   temp = []
   for i, group in enumerate(df_users.groups):
      temp.append(df_users.get_group(group))
   return temp

def get_users(df):
   df_users = df.groupby(["user"])
   temp = []
   print(">->")
   for i, group in enumerate(df_users.groups):
      print(group)
      temp.append(group)
   print(">->")      
   return temp

def group_func(df_list, func):
   temp = []
   for e in df_list:
      temp.append(func(e))
   return temp

def timeline(df):
  return df.resample("D").count().drop(columns=["user"])
   
def daily(df):
   df_daily = df.resample("D").count()
   df_daily['weekday'] = df_daily.index.day_name()
   df_daily['day'] = df_daily.index
   df_daily = df_daily.pivot(index='day', columns='weekday', values='user')
   df_daily = df_daily[['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', ]]
   # print(df_daily.columns)
   return df_daily

def hourly(df):
   df_hourly = df.resample("H").count()
   df_hourly['hour'] = df_hourly.index.hour
   df_hourly['day'] = df_hourly.index
   # df_hourly_mean = df_hourly.groupby(['hour']).mean()
   df_hourly = df_hourly.pivot(index='day', columns='hour', values='user')
   # df_hourly.iloc[0] = df_hourly.iloc[0].astype(object)
   df_hourly.columns = df_hourly.columns.astype(str)
   return df_hourly

def boxplot(df):
   df_daily_stats = df.describe()
   df_daily_stats.loc["iqr"] = df_daily_stats.loc['75%'] - df_daily_stats.loc['25%']
   df_daily_stats.loc["min"] = df_daily_stats.loc['25%'] - 1.5 * df_daily_stats.loc['iqr']
   df_daily_stats[df_daily_stats < 0] = 0
   df_daily_stats.loc["max"] = df_daily_stats.loc['75%'] + 1.5 * df_daily_stats.loc['iqr']
   df_daily_outliers = df[(df > df_daily_stats.loc['max']) | (df < df_daily_stats.loc['min'])].dropna(how='all')
   # print(df_daily_stats)
   # print(df_daily_outliers)
   outliers = df_daily_outliers.T.values.tolist()
   outliers = [[x for x in y if not np.isnan(x)] for y in outliers]
   df_daily_stats.loc["outliers"] = outliers
   # print(df_daily_stats)
   return df_daily_stats

def mean(df):
   df_daily_mean = df.describe()
   return df_daily_mean.loc[["mean"]]

def delay(df):
   df['datetime'] = df.index
   df['delta'] = (df['datetime'] - df['datetime'].shift()).fillna(pd.Timedelta(seconds=0))
   df["delta"] = df['delta'].dt.total_seconds().div(60).astype(int)
   return df

def heatmap(df):
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
   df_user = df_delta
   df_user['count'] = 1
   df2 = df_user.groupby(['delta_rnd','hour'], as_index=False).count()
   df_p = pd.pivot_table(df2, 'count', 'delta_rnd', 'hour')
   df_p = df_p.reindex(index=tags)
   df_p.columns = df_p.columns.astype(str)
   return df_p

def words(df):
   total_str = ""
   for val in df.msg:
      val = str(val)
      total_str += (val + " ")
   return total_str