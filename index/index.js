const stationMrk = require("../Resourses/station_markers.js").getStaMrk
const riskLvlAll = require("../Resourses/risk_level.js").getriskLvl
const lineSta = require("../Resourses/line_stations.js").getLineSta

const data = { // 地图默认数据
  scale: 14,
  latitude: 22.534751,
  longitude: 114.025510,
}
var riskLvl = riskLvlAll.norm
const nameNorm = "新增确诊病例 DEMO"
const nameDemo = "退出 DEMO"

Page({
  // 页面完成渲染
  onReady: function (e) {
    // 地图相关
    wx.getSystemInfo({
      success: (res) => {
        var h = res.windowHeight * 750 / res.windowWidth - 320
        this.setData({ mapHeight: h })
        if (res.theme == "light")
          this.setData({ mapStyle: 1 })
        if (res.theme == "dark")
          this.setData({ mapStyle: 2 })
      },
    })
    wx.onThemeChange((res) => {
      if (res.theme == "light")
        this.setData({ mapStyle: 1 })
      if (res.theme == "dark")
        this.setData({ mapStyle: 2 })
    })
    this.mapCtx = wx.createMapContext('myMap')
    // 设置marker
    var mrks = stationMrk
    for (var i = 0; i < mrks.length; i++) {
      mrks[i].id = i + 1000
      mrks[i] = this.generateMarker(mrks[i])
    }
    this.setData({
      latitude: data.latitude,
      longitude: data.longitude,
      scale: data.scale,
      markers: mrks,
      normdemo: nameNorm,
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
  bindNormDemo: function (e) {
    if (this.data.normdemo == nameNorm) {
      riskLvl = riskLvlAll.demo
      this.setData({ normdemo: nameDemo })
    } else if (this.data.normdemo == nameDemo) {
      riskLvl = riskLvlAll.norm
      this.setData({ normdemo: nameNorm })
    }
    this.mapCtx.getScale({
      success: (res) => {
        var mrks = this.data.markers
        var scale = res.scale
        for (var i in mrks) {
          mrks[i] = this.generateMarker(mrks[i])
          mrks[i].height = mrks[i].relative_size / data.scale * scale
          mrks[i].width = mrks[i].relative_size / data.scale * scale
        }
        this.setData({ markers: mrks })
      }
    })
  },
  // 其他函数
  generateMarker: function (m) {
    m.anchor = { "x": .5, "y": .5 }
    m.callout = undefined
    m.alpha = 1
    m.zIndex = riskLvl[m.name] // 数字越大，越在上层
    switch (riskLvl[m.name]) {
      case 1:
        m.iconPath = "../image/g.png"
        m.width = 20
        m.height = 20
        m.relative_size = 20
        break;
      case 2:
        m.iconPath = "../image/y.png"
        m.width = 24
        m.height = 24
        m.relative_size = 24
        break;
      case 3:
        m.iconPath = "../image/r.png"
        m.width = 28
        m.height = 28
        m.relative_size = 28
        break;
    }
    return m
  },
  generateCallout: function (m) {
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
  },
  selectMarker: function (info) {
    var mrks = this.data.markers
    var curIdx = mrks.findIndex(function (m) { return m.id == info.id || m.name == info.name })
    var curLines = mrks[curIdx].lineNum
    if (mrks[curIdx].id != this.lastId) { // 与上次选择不同
      mrks.forEach(function (m) {
        m.zIndex = riskLvl[m.name]
        m.callout = undefined
        m.alpha = 0.2
        for (let j in curLines)
          if (m.lineNum.includes(curLines[j]))
            m.alpha = 1
      })
      mrks[curIdx].callout = this.generateCallout(mrks[curIdx])
      mrks[curIdx].zIndex = 4
      this.lastId = mrks[curIdx].id
    } else { // 与上次选择相同
      mrks.forEach(function (m) {
        m.zIndex = riskLvl[m.name]
        m.callout = undefined
        m.alpha = 1
      })
      this.lastId = undefined
      console.log("same")
    }
    this.setData({ markers: mrks })
    return mrks[curIdx]
  },
})
