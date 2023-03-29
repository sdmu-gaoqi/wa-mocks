import mockData from '../mocks'

const customXML = {
  settings: {
    ajaxInterceptor_switchOn: false,
    ajaxInterceptor_rules: [],
  },
  originalXHR: window.XMLHttpRequest,
  myXHR: function () {
    const xhr = new customXML.originalXHR()
    const modifyResponse = () => {
      const rules = mockData
      Object.keys(rules).map((item) => {
        console.log(this.responseURL, 'this.responseURL')
        if (this.responseURL && this.responseURL?.indexOf(item) > -1) {
          this.responseText = rules[item]
          this.response = rules[item]
          window.dispatchEvent(
            new CustomEvent('pageScript', {
              detail: { url: this.responseURL, match: item },
            }),
          )
          console.log(this.responseURL, 'this.responseURL', item)
        }
      })
    }
    for (const attr in xhr) {
      if (attr === 'onreadystatechange') {
        xhr.onreadystatechange = (...args) => {
          if (this.readyState === 4) {
            modifyResponse()
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions, prefer-spread
          this.onreadystatechange && this.onreadystatechange.apply(this, args)
        }
        this.onreadystatechange = null
        continue
      } else if (attr === 'onload') {
        xhr.onload = (...args) => {
          modifyResponse()
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions, prefer-spread
          this.onload && this.onload.apply(this, args)
        }
        continue
      }

      if (typeof xhr?.[attr] === 'function') {
        this[attr] = xhr?.[attr].bind(xhr)
      } else {
        // responseText和response不是writeable的，但拦截时需要修改它，所以修改就存储在this[`_${attr}`]上
        if (attr === 'responseText' || attr === 'response') {
          Object.defineProperty(this, attr, {
            get: () => (this[`_${attr}`] == undefined ? xhr[attr] : this[`_${attr}`]),
            set: (val) => (this[`_${attr}`] = val),
            enumerable: true,
          })
        } else {
          Object.defineProperty(this, attr, {
            get: () => xhr[attr],
            set: (val) => (xhr[attr] = val),
            enumerable: true,
          })
        }
      }
    }
  },
  myFetch: function () {},
}

export default function Main() {
  window.addEventListener('message', ({ data }) => {
    if (data.type === 'ajaxInterceptor' && data.to === 'pageScript') {
      customXML.settings[data.key] = data.value
    }
    try {
      const self = window
      self.customXML = customXML
      self.XMLHttpRequest = customXML.myXHR
      self.fetch = customXML.myFetch
    } catch (err) {
      console.log(err, 'err')
    }
  })
}
