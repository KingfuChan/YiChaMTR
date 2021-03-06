const stationMrk = require("../Resourses/station_markers.js").getStaMrk
const riskLvl = require("../Resourses/risk_level.js").getriskLvl
const lineSta = require("../Resourses/line_stations.js").getLineSta

const data = { // 地图默认数据
  scale: 12,
  latitude: 22.534751,
  longitude: 114.025510,
}

function GenerateMarker(o, level) {
  o["anchor"] = { "x": .5, "y": .5 }
  switch (level) {
    case 1:
      o["callout"] = {
        color: '#000',
        bgColor: '#0f0',
        borderRadius: 6,
        borderColor: '#0f0',
        fontSize: 15,
        borderWidth: 6,
        textAlign: 'center',
        content: o["title"] + "\n低风险",
        display: "BYCLICK"
      }
      o["iconPath"] = "../image/g.png"
      o["width"] = "30rpx"
      o["height"] = "30rpx"
      break;
    case 2:
      o["callout"] = {
        color: '#000',
        bgColor: '#ff0',
        borderRadius: 6,
        borderColor: '#ff0',
        fontSize: 15,
        borderWidth: 6,
        textAlign: 'center',
        content: o["title"] + "\n中风险",
        display: "BYCLICK"
      }
      o["iconPath"] = "../image/y.png"
      o["width"] = "35rpx"
      o["height"] = "35rpx"
      break;
    case 3:
      o["callout"] = {
        color: '#fff',
        bgColor: '#f00',
        borderRadius: 6,
        borderColor: '#f00',
        fontSize: 15,
        borderWidth: 6,
        textAlign: 'center',
        content: o["title"] + "\n高风险",
        display: "BYCLICK"
      }
      o["iconPath"] = "../image/r.png"
      o["width"] = "40rpx"
      o["height"] = "40rpx"
      break;
  }
  return o
}

Page({
  onReady: function (e) {
    // 地图相关
    this.mapCtx = wx.createMapContext('myMap')
    var mrks = stationMrk
    this.loadData()

    // 选择器相关
    var lArr = Object.keys(lineSta)
    this.setData({
      lineArray: [lArr, lineSta[lArr[0]]],
    })
  },
  loadData: function (param) {
    var mrks = stationMrk
    var lat = data.latitude
    var lon = data.longitude
    var scl = data.scale
    for (var i = 0; i < mrks.length; i++) {
      mrks[i]["id"] = i
      mrks[i] = GenerateMarker(mrks[i], riskLvl[mrks[i]["name"]])
      if (param != undefined)  // there is param
        if (Object.keys(param).indexOf("ctrSta") > -1)
          if (mrks[i]["name"] == param["ctrSta"]) {
            mrks[i]["callout"]["display"] = "ALWAYS"
            lat = mrks[i]["latitude"]
            lon = mrks[i]["longitude"]
            scl = param["scale"]
          }
    }
    this.setData({
      latitude: lat,
      longitude: lon,
      scale: scl,
      markers: mrks
    })
    console.log("Data loaded!")
  },
  bindmarkertap: function (e) {
    var mrks = stationMrk
    for (var i = 0; i < mrks.length; i++) {
      mrks[i]["id"] = i
      mrks[i] = GenerateMarker(mrks[i], riskLvl[mrks[i]["name"]])
    }
    this.setData({ markers: mrks })
  },
  bindStationChange: function (e) { // 选择车站
    var lIdx = e.detail.value[0]
    var sIdx = e.detail.value[1]
    var lsDict = lineSta
    var lArr = Object.keys(lsDict)
    var sArr = Object.keys(lsDict[lArr[lIdx]])
    var sta = lsDict[lArr[lIdx]][sArr[sIdx]]
    this.loadData({
      "ctrSta": sta,
      scale: 15,
    })
  },
  bindLineChange: function (e) { // 选择线路
    if (e.detail.column == 0) {//第1列
      var lStaArr = lineSta
      var stas = lStaArr[Object.keys(lStaArr)[e.detail.value]]
      this.setData({
        lineArray: [Object.keys(lStaArr), stas]
      })
    }
  },
})
