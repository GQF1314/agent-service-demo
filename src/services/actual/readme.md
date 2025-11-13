# API 特化处理
1. 日程/任务 
- 原始api 
    - 当为allday 时，使用start_on,end_on 字段，只传日期不传时间
    - 非allday时，使用start_at,end_at字段
- agent api
    通用使用end，start ，带时间，通过识别 allday属性，分别转换

2. recipe 分为family_recpie和recommand_recipe，创建食谱，创建mealPlan
- 原始api
    - recommand_recipe 不可更新，更新实际为新创建一个family_recipe 关联到recommand_recipe
    - recommand_recipe在加入mealplan时，后端会创建一个对应的family_recipe,然后加入，需要前端传递 from:family_recipe or recommand_recipe
- agent api
    - 对agent屏蔽recipe类别差异， 所有获取的recipe（mealplan，search_recipe,get_recipe）的地方给recommand recipe的id加上前缀 `NORI_OUT_RECIPE_`
    - 在创建/删除/获取/更新 recipe/ mealplan时，id中去除前缀，工程上区分后分别调用不同api

本期先实现 recommand_recipe在加入mealplan的特化


