var hyperurl ="http://83.212.96.57:3000"

$(document).ready(function() {
    alertify.maxLogItems(6);

    $('.nav-item').click(function(){
        $('.nav-item.active').removeClass('active');
        $(this).toggleClass('active');
        setTimeout(()=>{
            $(window).scrollTop($(window).scrollTop()-100);
        }, 10)
    });
});

function LOG(text){
    alertify.log(text);
}

function ERROR(text){
    alertify.error(text);
}

function SUCC(text){
    alertify.success(text);
}

function request(url, method, data, done, error){
    loadIcon(true);
    $.ajax({url,method,data}).done(done).fail(error).always(()=>loadIcon(false));
}

String.prototype.format = function(){
    return this.valueOf().split('$$').reduce((acc, cur, i)=>acc+arguments[i-1]+cur);
}

function loadIcon(show){
    if(show){
        $('*').css({'cursor':'wait'});
    }else {
        $('*').css({'cursor':'default'});
    }
}

window.app = new Vue({
    el: '#app',
    mounted: function () {
        this.$nextTick(() => {
            this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            this.loadUsers().then(()=>{
                this.loadMedia();
                this.loadTran();                
                this.loadMediaTran();
            })
        });
    },
    watch: {
        'tranform.credit_receiver': function(n, o){
            if(n === this.tranform.credit_sender){
                this.tranform.credit_sender = o;
            }
        },
        'tranform.credit_sender': function(n, o){
            if(n === this.tranform.credit_receiver){
                this.tranform.credit_receiver = o;
            }
        },
        'mediaform.media_id': function(n, o){
            if(this.newsmedia[n]){
                this.mediaform.media_value = this.newsmedia[n].value;
            }
        }
    },
    methods: {
        loadUsers: function(log=false){
            return new Promise((resolve)=>{
                request(hyperurl+'/api/User', 'GET', {filter:'{}'}, (data)=>{
                    try{    
                        data.forEach((x)=>Vue.set(this.users, x.userId, x));
                        if(log){
                            SUCC(this.logs.DONE_LOAD_USERS);
                        }
                    } catch(e){
                        ERROR(this.logs.ERROR_LOAD_USERS);                    
                    } finally {
                        resolve();
                    }
                }, (error)=>{
                    ERROR(this.logs.ERROR_LOAD_USERS);
                    resolve();
                });
            });
        },
        loadMedia: function(log=false){
            request(hyperurl+'/api/Newsdata', 'GET', {filter:'{}'}, (data)=>{
                try{    
                    data.forEach((x)=>{
                        x.onUrlChange = false;
                        x.newUrl = '';
                        Vue.set(this.newsmedia, x.newsId, x)
                    });
                    if(log){
                        SUCC(this.logs.DONE_LOAD_MEDIA);
                    }
                } catch(e){
                    ERROR(this.logs.ERROR_LOAD_MEDIA);                    
                }
            }, (error)=>{
                ERROR(this.logs.ERROR_LOAD_MEDIA);
            });
        },
        loadMediaTran: function(log=false){
            request(hyperurl+'/api/BuyNewsTransaction', 'GET', {filter:'{}'}, (data)=>{
                try{    
                    data.forEach((x)=>Vue.set(this.mediatran, x.transactionId, x));
                    if(log){
                        SUCC(this.logs.DONE_LOAD_MEDIATRAN);
                    }
                } catch(e){
                    ERROR(this.logs.ERROR_LOAD_MEDIATRAN);                    
                }
            }, (error)=>{
                ERROR(this.logs.ERROR_LOAD_MEDIATRAN);
            });
        },
        loadTran: function(log=false){
            request(hyperurl+'/api/Payment', 'GET', {filter:'{}'}, (data)=>{
                try{    
                    data.forEach((x)=>Vue.set(this.tran, x.transactionId, x));
                    if(log){
                        SUCC(this.logs.DONE_LOAD_TRAN);
                    }
                } catch(e){
                    ERROR(this.logs.ERROR_LOAD_TRAN);                    
                }
            }, (error)=>{
                ERROR(this.logs.ERROR_LOAD_TRAN);
            });
        },
        sendCredits: function(){
            if(this.tranform.credit_receiver.length < 1 || this.tranform.credit_sender.length < 1 || this.tranform.credit_amount < 0.01){
                ERROR(this.logs.FORM_INCOMPLETE);
                return;
            }

            request(hyperurl+'/api/Payment', 'POST', {
                "$class": "org.acme.sample.Payment",
                "payer": this.users[this.tranform.credit_sender].$class + '#' + this.tranform.credit_sender,
                "receiving": this.users[this.tranform.credit_receiver].$class + '#' + this.tranform.credit_receiver,
                "value": this.tranform.credit_amount
            }, (data)=>{
                if(data.transactionId){
                    SUCC(this.logs.DONE_CREDIT_TRAN);
                    Vue.set(this.tran, data.transactionId, data);
                    this.loadTran(false);
                    this.loadUsers(false);
                } else{
                    ERROR(this.logs.ERROR_CREDIT_TRAN);                    
                }
            }, (error)=>{
                ERROR(this.logs.ERROR_CREDIT_TRAN);
            });
        },
        sendMedia: function(){
            if(!this.mediaform.media_id || !this.mediaform.media_receiver){
                ERROR(this.logs.FORM_INCOMPLETE);
                return;
            }

            request(hyperurl+'/api/BuyNewsTransaction', 'POST', {
                "$class": "org.acme.sample.BuyNewsTransaction",
                "newsdata": this.newsmedia[this.mediaform.media_id].$class + '#' + this.mediaform.media_id,
                "consumer": this.users[this.mediaform.media_receiver].$class + '#' + this.mediaform.media_receiver
            }, (data)=>{
                if(data.transactionId){
                    SUCC(this.logs.DONE_MEDIA_BUY);
                    Vue.set(this.mediatran, data.transactionId, data);
                    this.loadMediaTran(false);
                    this.loadUsers(false);
                } else{
                    ERROR(this.logs.ERROR_MEDIA_BUY);                    
                }
            }, (error)=>{
                ERROR(this.logs.ERROR_MEDIA_BUY);
            });
        },
        onUrlChange: function(e, v){
            v.onUrlChange = true;
            this.$nextTick(() => {
                if(e.path.length == 11)
                    $(e.target).next().focus();
                else
                    $(e.target).find('input').first().focus();
            });
        },
        changeUrl: function(e, v){
            v.onUrlChange = false;

            if(v.newUrl != '' && v.urls != v.newUrl){ 
                request(hyperurl+'/api/ChangeUrl', 'POST', {
                    "$class": "org.acme.sample.ChangeUrl",
                    "newsdata": v.$class + '#' + v.newsId,
                    "publisher": v.publisher,
                    "newurl": v.newUrl
                }, (data)=>{
                    if(data.transactionId){
                        SUCC(this.logs.DONE_URL_CHANGE);
                        v.urls = v.newUrl;
                        v.newUrl = '';
                    } else{
                        ERROR(this.logs.ERROR_URL_CHANGE);                    
                    }
                }, (error)=>{
                    ERROR(this.logs.ERROR_URL_CHANGE);
                });
            }
        },
        uploadMedia: function(){
            for(let e of Object.entries(this.mnewform)){
                if(e[1] == undefined){
                    LOG('Please complete ' + e[0]);
                    return;
                }
            }

            request(hyperurl+'/api/Newsdata', 'POST', this.mnewform, (data)=>{
                if(data.newsId){
                    SUCC(this.logs.DONE_MEDIA_UPLOAD);
                    Vue.set(this.newsmedia, data.newsId, data);
                    this.clearmnew();
                } else{
                    ERROR(this.logs.ERROR_MEDIA_UPLOAD);                    
                }
            }, (error)=>{
                ERROR(this.logs.ERROR_MEDIA_UPLOAD);
            });
        },
        clearmnew: function(){
            for(let k of Object.keys(this.mnewform)){
                this.mnewform[k] = undefined;
            }

            this.mnewform.$class = "org.acme.sample.Newsdata";
            this.mnewform.published = true;
        },
        assetsPublished: function(k){
            let u = this.users[k];

            request(hyperurl+'/api/queries/selectAssetsbyOwner', 'GET', {
                publisher: 'resource:' + u.$class + '#' + u.userId
            }, (data)=>{
                if(data.length != undefined){
                    Vue.set(this.ownerAssets, 'data', data);
                    setTimeout(
                        ()=>alertify.alert(
                            '<h4>Assets published by '+
                            u.firstName+' '+u.lastName+
                            '</h4>'+
                            $('#ownerAssetsTable')[0].outerHTML.replace('display: none;','display:table;')
                        ),
                        1000
                    );
                } else{
                    ERROR(this.logs.ERROR_ASSET_QUERY);
                }
            }, (error)=>{
                ERROR(this.logs.ERROR_ASSET_QUERY);
            });
        }
    },
    filters: {
        shorter: function(v){
            return v.substr(0, 8) + '..';
        },
        getID: function(v){
            return v.split('#')[1];
        },
        dateformat: function(value) {
            if(value)
                return (new Date(value)).toLocaleString('en-UK', { timeZone: this.timezone , hour12: false});
            else
                return 'Loading ..';
        },
        getUserName: function(u){
            if(typeof u == 'string')
                u = app.$data.users[u];
            return u.firstName;// + ' ' + u.lastName;
        },
        mediaTitle: function(id){
            return id + ' ' + app.$data.newsmedia[id].title;
        }
    },
    data: {
        timezone: '',
        users: {},
        newsmedia: {},
        ownerAssets: {data:[]},
        mnewform: {
            $class: "org.acme.sample.Newsdata",
            published: true,
            newsId : undefined,
            publisher: undefined,
            title: undefined,
            description: undefined,
            urls: undefined,
            value: undefined
        },
        mediatran: {},
        mediaform: {},
        tran: {},
        tranform: {
            credit_receiver: '',
            credit_sender: '',
            credit_amount: 1
        },
        logs: {
            FORM_INCOMPLETE: 'Incomplete form',
            ERROR_LOAD_USERS: 'Unable to load users',
            DONE_LOAD_USERS: 'Reloaded users',
            ERROR_LOAD_MEDIA: 'Unable to load news media',
            DONE_LOAD_MEDIA: 'Reloaded news media',
            ERROR_LOAD_MEDIATRAN: 'Unable to load media transactions',
            DONE_LOAD_MEDIATRAN: 'Reloaded media transactions',
            ERROR_LOAD_TRAN: 'Unable to load transactions',
            DONE_LOAD_TRAN: 'Reloaded transactions',
            ERROR_CREDIT_TRAN: 'Transaction failed',
            DONE_CREDIT_TRAN: 'Transaction published',
            DONE_MEDIA_BUY: 'Newsdata bought',
            ERROR_MEDIA_BUY: 'Transaction failed',
            DONE_URL_CHANGE: 'Url changed',
            ERROR_URL_CHANGE: 'Failed to change url',
            DONE_MEDIA_UPLOAD: 'Media uploaded',
            ERROR_MEDIA_UPLOAD: 'Uploading failed',
            ERROR_ASSET_QUERY: 'Failed to query assets'
        }
    }
});