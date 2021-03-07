const stationMrk = require("../Resourses/station_markers.js").getStaMrk
const riskLvl = require("../Resourses/risk_level.js").getriskLvl
const lineSta = require("../Resourses/line_stations.js").getLineSta

const data = { // 地图默认数据
  scale: 14,
  latitude: 22.534751,
  longitude: 114.025510,
}

function GenerateMarker(m) {
  m.anchor = { "x": .5, "y": .5 }
  m.callout = undefined
  m.alpha = 1
  m.zIndex = riskLvl[m.name] // 数字越大，越在上层
  switch (riskLvl[m.name]) {
    case 1:
      m.iconPath = "../image/g.png"
      m.width = 18
      m.height = 18
      m.relative_size = 18
      break;
    case 2:
      m.iconPath = "../image/y.png"
      m.width = 22
      m.height = 22
      m.relative_size = 22
      break;
    case 3:
      m.iconPath = "../image/r.png"
      m.width = 25
      m.height = 25
      m.relative_size = 25
      break;
  }
  return m
}

function generateCallout(m) {
  var mc = {
    borderRadius: 6,
    fontSize: 15,
    borderWidth: 6,
    textAlign: 'center',
    display: "ALWAYS"
  }
  switch (riskLvl[m.name]) {
    case 1:
      mc.color = '#000'
      mc.bgColor = '#0f0'
      mc.borderColor = '#0f0'
      mc.content = m.name + "\n" + m.lineName + "\n风险等级：低"
      break;
    case 2:
      mc.color = '#000'
      mc.bgColor = '#ff0'
      mc.borderColor = '#ff0'
      mc.content = m.name + "\n" + m.lineName + "\n风险等级：中"
      break;
    case 3:
      mc.color = '#fff'
      mc.bgColor = '#f00'
      mc.borderColor = '#f00'
      mc.content = m.name + "\n" + m.lineName + "\n风险等级：高"
      break;
  }
  return mc
}


Page({
  // 页面完成渲染
  onReady: function (e) {
    // 地图相关
    wx.getSystemInfo({
      success: (result) => {
        var h = result.windowHeight * 750 / result.windowWidth - 320
        this.setData({ mapHeight: h })
        if (result.theme == "light")
          this.setData({ mapStyle: 1 })
        if (result.theme == "dark")
          this.setData({ mapStyle: 2 })
      },
    })
    wx.onThemeChange((result) => {
      if (result.theme == "light")
        this.setData({ mapStyle: 1 })
      if (result.theme == "dark")
        this.setData({ mapStyle: 2 })
    })
    this.mapCtx = wx.createMapContext('myMap')
    // 设置marker
    var mrks = stationMrk
    for (var i = 0; i < mrks.length; i++) {
      mrks[i].id = i + 1000
      mrks[i] = GenerateMarker(mrks[i])
    }
    this.setData({
      latitude: data.latitude,
      longitude: data.longitude,
      scale: data.scale,
      markers: mrks
    })
    // 选择器相关
    var lArr = Object.keys(lineSta)
    this.setData({
      lineArray: [lArr, lineSta[lArr[0]]],
    })
  },
  // 点击标记
  bindmarkertap: function (e) {
    this.selectMarker({ id: e.detail.markerId })
    // var mrks = this.data.markers
    // for (let i in mrks) {
    //   if (e.detail.markerId == mrks[i].id) {
    //     mrks[i].callout = generateCallout(mrks[i])
    //     mrks[i].zIndex = 4
    //     var curMrk = mrks[i]
    //   }
    //   else {
    //     mrks[i].callout = undefined
    //     mrks[i].zIndex = riskLvl[mrks[i].name]
    //   }
    // }
    // for (let i in mrks) {
    //   mrks[i].alpha = 0.2
    //   for (let j in curMrk.lineNum)
    //     if (mrks[i].lineNum.includes(curMrk.lineNum[j]))
    //       mrks[i].alpha = 1
    // }
    // this.setData({ markers: mrks })
  },
  // 地图显示区域变化
  bindregionchange: function (e) {
    if (e.type == "end") {
      var mrks = this.data.markers
      for (var i in mrks) {
        mrks[i].height = mrks[i].relative_size / data.scale * e.detail.scale
        mrks[i].width = mrks[i].relative_size / data.scale * e.detail.scale
      }
      this.setData({ markers: mrks })
    }
  },
  // 选择线路车站
  bindStationChange: function (e) {
    var lIdx = e.detail.value[0]
    var sIdx = e.detail.value[1]
    var lsDict = lineSta
    var lArr = Object.keys(lsDict)
    var sArr = Object.keys(lsDict[lArr[lIdx]])
    var sta = lsDict[lArr[lIdx]][sArr[sIdx]]
    var curMrk = this.selectMarker({ name: sta })
    this.setData({
      latitude: curMrk.latitude,
      longitude: curMrk.longitude,
      scale: data.scale,
    })
  },
  // 选择线路
  bindLineChange: function (e) {
    if (e.detail.column == 0) {//第1列
      var lStaArr = lineSta
      var stas = lStaArr[Object.keys(lStaArr)[e.detail.value]]
      this.setData({
        lineArray: [Object.keys(lStaArr), stas]
      })
    }
  },
  selectMarker: function (info) {
    var curMrk
    var mrks = this.data.markers
    mrks.forEach(function (m) {
      if (m.name == info.name || m.id == info.id) {
        m.callout = generateCallout(m)
        m.zIndex = 4
        curMrk = m
      } else {
        m.zIndex = riskLvl[m.name]
        m.callout = undefined
      }
    })
    mrks.forEach(function (m) {
      m.alpha = 0.2
      for (let j in curMrk.lineNum)
        if (m.lineNum.includes(curMrk.lineNum[j]))
          m.alpha = 1
    })
    this.setData({ markers: mrks })
    return curMrk
  },
})
