var NoticeLayer = cc.Layer.extend({
    _listNotice: null,
    ctor: function () {
        this._super();
        this.startY = this.height / 2 + 90;
        this.defaultBGCapatity = 60;
        this.defaultNoticeSize = 42;
        this.defaultTime = 80;
        this.maxItem = 8;
        this._init();
    },
    _init: function () {
        this._listNotice = [];
        for (let i = 0; i < this.maxItem; i++) {
            let bg = new cc.LayerColor();
            bg.retain();
            bg.setColor(new cc.Color(0, 0, 0));
            bg.attr({
                // x: this.width/2,
                y: this.startY + i * this.defaultNoticeSize,
                width: 3000,
                height: 40
            })
            bg.setOpacity(0);

            let notice = new cc.LabelBMFont(100, FONT.SOJI_20);
            notice.retain();
            notice.setString("");
            notice.attr({
                x: this.width / 2,
                y: this.startY + 20 + i * this.defaultNoticeSize,
            })
            notice.setColor(new cc.Color(255, 0, 0));

            this._listNotice.push({
                bg: bg,
                notice: notice,
                timeRemaining: 0,
                content: "",
            })
            this.addChild(bg);
            this.addChild(notice);
        }
    },

    update: function () {
        this._listNotice.forEach((function (item) {
            if (item.timeRemaining === 0) {
                item.bg.runAction(cc.fadeOut(1));
                item.notice.runAction(cc.fadeOut(1));
            } else if (item.timeRemaining > 0) {
                if (item.bg.getNumberOfRunningActions() > 0) item.bg.stopAllActions();
                if (item.notice.getNumberOfRunningActions() > 0) item.notice.stopAllActions();
                item.bg.setOpacity(this.defaultBGCapatity);
                item.notice.setOpacity(255);
            }
            item.timeRemaining -= 1;
        }).bind(this))
    },

    showNotice: function (mess) {
        for (let i = this.maxItem - 1; i > 0; i--) {
            let itemS = this._listNotice[i];
            let itemT = this._listNotice[i - 1];
            itemS.content = itemT.content;
            itemS.notice.setString(itemT.content);
            itemS.timeRemaining = itemT.timeRemaining;
        }
        let newItem = this._listNotice[0];
        newItem.notice.setString(mess);
        newItem.content = mess;
        newItem.timeRemaining = this.defaultTime;
    },

    reset: function () {
        this._listNotice.forEach(function (item) {
            item.content = "";
            item.timeRemaining = 0;
        })
    }
})