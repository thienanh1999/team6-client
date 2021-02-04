var Animation = {
    createAnimation: function (numFrames, path, n_direc,time,w,h) {
        let idleFrames = [];
        let fullPath;
        var index = 0;
        let listAnimation = [];
        for (let i = 0; i < n_direc; i++) {
            idleFrames[i] = [];
            for (let j = 0; j < numFrames; j++) {
                if (index < 10) {
                    fullPath = path + "0" + index + ".png";
                } else {
                    fullPath = path + "" + index + ".png";
                }
                // cc.log("full path:" + fullPath);
                let frame = new cc.SpriteFrame(fullPath, cc.rect(0, 0, w, h));
                idleFrames[i].push(frame)
                index += 1;
            }
            listAnimation.push(new cc.Animation(idleFrames[i], time / numFrames));
        }
        if (n_direc != 1) {
            listAnimation.push(listAnimation[3].clone());
            listAnimation.push(listAnimation[2].clone());
            listAnimation.push(listAnimation[1].clone());
        }
        for (let i = 0; i < 5; i++) {
            let animation = cc.sequence(
                cc.flipX(false),
                cc.Animate(listAnimation[i])
            ).repeat(1);
            animation.retain();
            listAnimation[i] = animation;
        }
        if (n_direc == 1) return listAnimation;
        for (let i = 5; i < 8; i++) {
            let animation = cc.sequence(
                cc.flipX(true),
                cc.Animate(listAnimation[i])
            ).repeat(1)
            animation.retain();
            listAnimation[i] = animation;
        }
        return listAnimation;
    },

    createSingleAnimation: function (rootPath, numFrames, w, h) {
        let frames = [];
        let fullPath;
        for (let i = 0; i < 8; i++) {
            if (i < 10) fullPath = rootPath + "0" + i + ".png";
            else fullPath = rootPath + i + ".png";
            let frame = new cc.SpriteFrame(fullPath, cc.rect(0, 0, w, h));
            frames.push(frame);
        }
        let animation = new cc.Animation(frames, 1 / numFrames / BATTLE_SPEED);
        animation.retain();
        return animation;
    }
};