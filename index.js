/**
 * @description: utils
 * @author:肖文龙
 */

/**
 * 过滤对象中为空的属性
 * @param obj
 * @returns {*}
 */
export function filterObj(object) {
    const obj = JSON.parse(JSON.stringify(object))// 深拷贝
    if (!(typeof obj === 'object')) {
        return
    }

    for (const key in obj) {
        if (obj.hasOwnProperty(key) &&
            (obj[key] == null || obj[key] === undefined || obj[key] === '')) {
            delete obj[key]
        }
    }
    return obj
}

/**
 * 将JSon对象已输入的参数初始化
 * @param obj
 * @returns obj
 */
export function restoreInitialValue(data) {
    for (const key in data) {
        if (data[key] instanceof Array) {
            data[key] = []
        } else if (data[key] instanceof Object) {
            data[key] = {}
        } else {
            data[key] = ''
        }
    }
}

/**
 * 分页功能
 * @param obj
 * @returns data查询参数 list 数据列表  paginationData 分页参数或者为回调函数
 */
export function paging(data = {}, list = [], paginationData = {}) {
    const fromData = { ...filterObj(data) }// 遍历去掉为空的key
    delete fromData.pageSize
    delete fromData.pageNo
    // 搜索数据
    const allList = search(list)
    function search(children) {
        return children.filter((item) => {
            let onOff = true// 开关
            // 得到筛选数据
            for (const key of Object.keys(fromData)) {
                // 模糊查询
                if (fromData[key] && !item[key].includes(fromData[key])) {
                    onOff = false
                }
            }
            if (item.children && item.children.length > 0) {
                item.children = search(item.children)
                if (item.children && item.children.length > 0) onOff = true
            }
            return onOff
        })
    }
    if (paginationData instanceof Function) {
        paginationData(allList.length)
    } else {
        paginationData.total = allList.length// 总条数
    }
    const param = {
        pageSize: data.pageSize,
        pageNo: data.pageNo,
        ...paginationData
    }
    const _list = []
    // 分页数据
    allList.forEach((item, index) => {
        // index >= ((param.pageSize * param.pageNo) - param.pageSize) 计算初始值&&
        // index < (param.pageSize * param.pageNo) 计算结束值
        // 得到筛选数据
        if (index >= ((param.pageSize * param.pageNo) - param.pageSize) && index < (param.pageSize * param.pageNo)) {
            _list.push(item)
        }
    })
    return _list
}

/**
 * 将JSon对象已字符串形式拼接
 * @param obj
 * @returns string
 */
export function createURL(param) {
    let link = ''
    for (const i in param) {
        link += '&' + i + '=' + param[i]
    }
    link = '?' + link.substr(1)

    return link.replace('', '')
}

/**
 * 生成随机Uid
 * @param ''
 * @returns string
 */
export function randomData() {
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let nums = ''
    for (let i = 0; i < 32; i++) {
        const id = parseInt(Math.random() * 35)
        nums += chars[id]
    }
    return nums
}

/**
 * 深度克隆对象、数组
 * @param obj 被克隆的对象
 * @return 克隆后的对象
 */
export function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj))
}

/**
 * 金额转千分位
 * @param str>要转换的参数  size>分割长度默认为长度为3个 delimiter>以什么字符分割默认为 逗号
 * @returns string
 */
export function moneyFormat(str, size, delimiter) {
    if (str) {
        const _str = str.toString()
        const _size = size || 3
        const _delimiter = delimiter || ','
        const regText = '\\B(?=(\\w{' + _size + '})+(?!\\w))'
        const reg = new RegExp(regText, 'g')
        return _str.replace(reg, _delimiter)
    } else {
        return str
    }
}

/**
 * 百分比计算
 * @param number Toal 总数，num 其它数值
 * @returns number
 */
export function GetPercent(num, total) {
    num = parseFloat(num)
    total = parseFloat(total)
    if (isNaN(num) || isNaN(total)) {
        return ''
    }
    return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00)
}

/**
 * 数字转大写金额
 * @param number
 * @returns string
 */
export function numberChinese(money) {
    // 汉字的数字
    const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    // 基本单位
    const cnIntRadice = ['', '拾', '佰', '仟']
    // 对应整数部分扩展单位
    const cnIntUnits = ['', '万', '亿', '兆']
    // 对应小数部分单位
    const cnDecUnits = ['角', '分', '厘', '毫']
    // 整数金额时后面跟的字符
    const cnInteger = '整'
    // 整型完以后的单位
    const cnIntLast = '元'
    // 最大处理的数字
    const maxNum = 999999999999999.999999
    // 金额整数部分
    let integerNum
    // 金额小数部分
    let decimalNum
    // 输出的中文金额字符串
    let chineseStr = ''
    // 分离金额后用的数组，预定义
    let parts
    if (money === '') {
        return ''
    }
    money = parseFloat(money)
    if (money >= maxNum) {
        // 超出最大处理数字
        return ''
    }
    if (money === 0) {
        chineseStr = cnNums[0] + cnIntLast + cnInteger
        return chineseStr
    }
    // 转换为字符串
    money = money.toString()
    if (money.indexOf('.') === -1) {
        integerNum = money
        decimalNum = ''
    } else {
        parts = money.split('.')
        integerNum = parts[0]
        decimalNum = parts[1].substr(0, 4)
    }
    // 获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
        let zeroCount = 0
        const IntLen = integerNum.length
        for (let i = 0; i < IntLen; i++) {
            const n = integerNum.substr(i, 1)
            const p = IntLen - i - 1
            const q = p / 4
            const m = p % 4
            if (n === '0') {
                zeroCount++
            } else {
                if (zeroCount > 0) {
                    chineseStr += cnNums[0]
                }
                // 归零
                zeroCount = 0
                chineseStr += cnNums[parseInt(n)] + cnIntRadice[m]
            }
            if (m === 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[q]
            }
        }
        chineseStr += cnIntLast
    }
    // 小数部分
    if (decimalNum !== '') {
        const decLen = decimalNum.length
        for (let i = 0; i < decLen; i++) {
            const n = decimalNum.substr(i, 1)
            if (n !== '0') {
                chineseStr += cnNums[Number(n)] + cnDecUnits[i]
            }
        }
    }
    if (chineseStr === '') {
        chineseStr += cnNums[0] + cnIntLast + cnInteger
    } else if (decimalNum === '') {
        chineseStr += cnInteger
    }
    return chineseStr
}
/**
 * 为数字加上单位：万或亿
 *
 * 例如：
 *      1000.01 => 1000.01
 *      10000 => 1万
 *      99000 => 9.9万
 *      566000 => 56.6万
 *      5660000 => 566万
 *      44440000 => 4444万
 *      11111000 => 1111.1万
 *      444400000 => 4.44亿
 *      40000000,00000000,00000000 => 4000万亿亿
 *      4,00000000,00000000,00000000 => 4亿亿亿
 *
 * @param {number} number 输入数字.
 * @param {number} decimalDigit 小数点后最多位数，默认为2
 * @return {string} 加上单位后的数字
 */
export function addChineseUnit(number, decimalDigit) {
    var addWan = function(integer, number, mutiple, decimalDigit) {
        var digit = getDigit(integer)
        if (digit > 3) {
            var remainder = digit % 8
            if (remainder >= 5) { // ‘十万’、‘百万’、‘千万’显示为‘万’
                remainder = 4
            }
            return Math.round(number / Math.pow(10, remainder + mutiple - decimalDigit)) / Math.pow(10, decimalDigit) + '万'
        } else {
            return Math.round(number / Math.pow(10, mutiple - decimalDigit)) / Math.pow(10, decimalDigit)
        }
    }

    var getDigit = function(integer) {
        var digit = -1
        while (integer >= 1) {
            digit++
            integer = integer / 10
        }
        return digit
    }
    decimalDigit = decimalDigit == null ? 2 : decimalDigit
    var integer = Math.floor(number)
    var digit = getDigit(integer)
    // ['个', '十', '百', '千', '万', '十万', '百万', '千万'];
    var unit = []
    if (digit > 3) {
        var multiple = Math.floor(digit / 8)
        if (multiple >= 1) {
            var tmp = Math.round(integer / Math.pow(10, 8 * multiple))
            unit.push(addWan(tmp, number, 8 * multiple, decimalDigit))
            for (var i = 0; i < multiple; i++) {
                unit.push('亿')
            }
            return unit.join('')
        } else {
            return addWan(integer, number, 0, decimalDigit)
        }
    } else {
        return number
    }
}
/*
* 总数计算
* @param data：json
* @return number
* */
export function totalHeadCount(data) {
    let total = 0 // 总数
    if (data) {
        // 循环json取到value值
        for (const key of Object.keys(data)) {
            const number = Number(data[key])// 转成数字
            if (typeof number === 'number') {
                total += number
            }
        }
    } else {
        this.$message({
            message: '请输入【totalHeadCount】函数方法中要计算的参数。',
            type: 'warning'
        })
    }
    return total
}

/**
 * 校验表单不通过
 * @param {key:value} __this:当前组件的this
 * @returns ''
 */
export function validFn(field, __this) {
    if (!field && !__this) {
        this.$message({
            message: '请输入【validFn】函数校验输入框方法中的参数。',
            type: 'warning'
        })
        return
    }
    let refName = null
    let left = null
    let top = null
    for (const key in field) {
        const _this = __this.$refs[key] && __this.$refs[key].$el.getBoundingClientRect()
        if (top === null) {
            top = _this.top
            left = _this.left
            refName = key
        } else {
            if (top > _this.top) {
                top = _this.top
                left = _this.left
                refName = key
            } else {
                if (left > _this.left) {
                    top = _this.top
                    left = _this.left
                    refName = key
                }
            }
        }
    }
    if (__this.$refs[refName].$el.getElementsByTagName('input').length > 0) {
        __this.$refs[refName].$el.getElementsByTagName('input')[0].focus()
    }
}

/**
 * 数据流文件下载 导出文件
 * @param {
 *     data:文件流
 *     name文件名称
 * }
 * @returns {fileDOwload}
 */
export function download(data, name) {
    if (!data) {
        return
    }
    // 判断浏览器navigator.userAgent
    var isIE = navigator.userAgent.indexOf('compatible') > -1 && navigator.userAgent.indexOf('MSIE') > -1 // 判断是否IE<11浏览器
    var isEdge = navigator.userAgent.indexOf('Edge') > -1 && !isIE // 判断是否IE的Edge浏览器
    var isIE11 = navigator.userAgent.indexOf('Trident') > -1 && navigator.userAgent.indexOf('rv:11.0') > -1
    // IE
    if (isIE || isEdge || isIE11) {
        const fileName = name || 'excel.xls'
        navigator.msSaveBlob(data, fileName)
        return
    }
    // 非IE
    const url = window.URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    if (name) {
        link.setAttribute('download', `${name}`)
    } else {
        link.setAttribute('download')
    }
    document.body.appendChild(link)
    link.click()
}

/**
 * a标签下载文件
 * @param {
 *     url：下载地址
 *    name：文件名称
 * }
 * @returns {fileDOwload}
 */
export function downloadUrlFile(url, name) {
    const a = document.createElement('a') // 创建a标签
    a.setAttribute('download', name || '')// download属性
    a.setAttribute('href', url)// href链接
    a.click()// 自执行点击事件
}

/**
 * 字典值替换文本通用方法
 * @param dictOptions  字典数组
 * @param texts  字典值
 * @return String
 */
export function filterDictText(dictOptions, texts) {
    texts = texts ? String(texts) : ''
    if (dictOptions.length > 0) {
        if (texts) {
            texts = texts.includes(',') ? texts.split(',') : [texts]
            if (dictOptions instanceof Array) {
                for (const dictItem of dictOptions) {
                    if (texts.length > 0) {
                        texts.forEach((text, index) => {
                            if (text === dictItem.typecode) {
                                texts[index] = dictItem.typename
                            }
                        })
                    }
                }
            }
            return texts.join(',')
        }
    }
}

/*
取最大最小值
type: min 取最小值 max 取最大值 sort 只是单一排序 必填
arr: 数组（内容可以是下标或string，json对象，number）必填
key:要对比的字段 string 非必填(如有data参数则必填)
data 对象(可有可无，如果有里面必须包含设置的key)
列:mathSort({type: 'min',arr: [{a:1}],key: 'a')   返回最小值
列:mathSort({type: 'max',arr: [1,2,3])      返回最大值
列:mathSort({type: 'sort',arr: ['12sdcsd','asdfds'],key: 'a',data:{'12sdcsd':{a:1},'asdfds':{a:2}})//   返回排序过后的数组
*/
export function mathSort({ type, arr, key, data }) {
    if (!type && !arr) {
        console.error('请填入必填参数')
        return
    }
    arr = arr.sort(function(a, b) {
        if (data && key) {
            return data[a][key] - data[b][key]
        } else if (key) {
            return a[key] - b[key]
        } else {
            return a - b
        }
    })
    // 判断是取最大值还是最小值还是srot 排序
    if (type === 'min') {
        return arr[0]
    } else if (type === 'max') {
        return arr[arr.length]
    } else if (type === 'sort') {
        return arr // 返回arr
    }
}
/**
 * 替换时间格式保存00秒方法
 * @param times  时间
 * @return String
 */
export function formatTimeSecond(times) {
    const formatstrtime = times && times.substr(0, 17) + '00'
    return formatstrtime
}
