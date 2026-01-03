Page({
  data: {
    messages: [
      { type: 'ai', content: '您好，我是您的AI点餐助手，有什么可以帮您？' }
    ],
    inputValue: '',
    loading: false,
    scrollTop: 0
  },

  onLoad() {
    
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  handleInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content) return;

    const newMessages = [...this.data.messages, { type: 'user', content }];
    this.setData({
      messages: newMessages,
      inputValue: '',
      loading: true,
      scrollTop: newMessages.length * 1000 // Scroll to bottom hack
    });

    const app = getApp();
    // Try to get baseUrl from globalData or default
    const baseUrl = 'http://localhost:5174';
    // TODO 现在这个接口报错401，并且参数少了chatId，之后再调吧
    //      现在至少有个前端，剩下的不是问题
    wx.request({
      url: `${baseUrl}/ai/service`,
      method: 'GET',
      data: { message: content },
      success: (res) => {
        // Adapt to response structure. Assuming { data: "response text" } or { code: 1, data: ... }
        let reply = '抱歉，系统暂时无法处理您的请求，请稍后再试。';
        if (res.data) {
           if (typeof res.data === 'string') {
             reply = res.data;
           } else if (res.data.data) {
             reply = res.data.data;
           } else if (res.data.msg) {
             reply = res.data.msg;
           }
        }
        
        this.setData({
          messages: [...this.data.messages, { type: 'ai', content: reply }],
          scrollTop: (this.data.messages.length + 1) * 1000
        });
      },
      fail: (err) => {
        console.error(err);
        this.setData({
          messages: [...this.data.messages, { type: 'ai', content: '网络错误，请检查连接。' }],
          scrollTop: (this.data.messages.length + 1) * 1000
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  }
});
