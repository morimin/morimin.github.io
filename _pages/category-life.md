---
title: "생활정보 관련 포스트 모음"
layout: archive
permalink: categories/life
author_profile: true
sidebar_main: true
---

{% assign posts = site.categories.LIFE %}
{% for post in posts %} {% include archive-single2.html type=page.entries_layout %} {% endfor %}
