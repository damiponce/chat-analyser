# type: ignore

df_users = users(df)
# print(type(df_users))

df_user_list = get_users(df)

df_timeline_users = group_func(df_users, timeline)
df_timeline_users.append(timeline(df))
# print(df_timeline)
# df_timeline_users = df_timeline_users.drop(columns=["user"])
df_timeline_dict = []
for x in df_timeline_users:
   df_timeline_dict.append(x.to_json(orient="split", date_format="iso"))
# df_timeline_dict = df_timeline.to_json(orient="split", date_format="iso")
# print(df_timeline_dict)

df_daily = daily(df)
df_daily_users = group_func(df_users, daily)
df_daily_users_stats = group_func(df_daily_users, boxplot)
# df_daily_users_stats.append(boxplot(df_daily))
df_daily_stats_dict = []
for x in df_daily_users_stats:
   df_daily_stats_dict.append(x.to_json(orient="columns"))

# df_daily_stats_dict = df_daily_users_stats.to_json(orient="columns")

df_hourly = hourly(df)
df_hourly_users = group_func(df_users, hourly)
df_hourly_users_stats = group_func(df_hourly_users, boxplot)
# df_hourly_users_stats.append(boxplot(df_hourly))
df_hourly_stats_dict = []
for x in df_hourly_users_stats:
   df_hourly_stats_dict.append(x.to_json(orient="columns"))

# df_hourly_stats = boxplot(df_hourly)
# print(df_hourly_stats)
# df_hourly_stats_dict = df_hourly_stats.to_json(orient="columns")

df_p = heatmap(delay(df))
# print(df_p)
df_heatmap = df_p.to_json(orient="columns")

df_words = words(df)

print("^^^^^^^^^^^^^ PYTHON ^^^^^^^^^^^^^")