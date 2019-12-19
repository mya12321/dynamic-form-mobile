import { Base64 } from 'js-base64';
import DynamicForm2 from '@/components/DynamicForm2.vue';

// 每一模块的默认高度,vh
const gHeight = 47;

export default {
    name: 'MatterParticleChoose',

    data() {
        return {
            // 须知项列表
            noticeList: [],

            // 委办局地址
            govAddress: null,

            // 委办局电话号码
            govTel: null,

            // 委办局经纬度坐标
            govPos: {},

            // "线上办理需要准备的材料"中的"办理材料"
            samplesList: [],

            // 每项须知的展开状态, - 是否展开
            expandStatus: [],

            // 每项须知是否显示展开条
            showExpandBar: [],

            schema: [],
            content: {},
            rule: {},
            objMapping: {},
            controlMapping: {},
            matterTreeData: [],
            groupList: [],
            matterName: '',
            legacyUserMatter: {},
            checkVal: true,
        }
    },

    components: {
      DynamicForm2
    },

    mounted() {
        // 获取所有已上架的事项须知项
        this.getAllNotice();

        // 获取事项所属的委办局信息
        this.getGovInfo();

        // 获取办理材料（管理台中的样本配置的材料）
        this.getSamples();

        // 获取该用户未填完的事项
        this.getLegacyUserMatter();
    },

    methods: {
        /*
         * 展开或收缩须知项
        */
        expandNotice(index) {
            // 当模块没有达到收缩展开最小高度时，屏蔽收缩展开功能
            if ( !this.showExpandBar[index] ) {
                return;
            }

            if ( !this.expandStatus[index] ) {
                this.$refs.itemBlockContent[index].style.height = 'auto';
                this.$set(this.expandStatus, index, true);
            }
            else {
                this.$refs.itemBlockContent[index].style.height = `${gHeight}vh`;
                this.$set(this.expandStatus, index, false);
            }

            if ( index === 0 ) {
                this.$refs.partMainWrap.scrollTop = 0;
            }
        },

        /*
         * 获取后台配置的事项须知项，用于颗粒度选择
         * @param mustPutAway: true - 获取上架须知项； false - 获取所有须知项
         * @param returnContent: 是否获取富文本
        */
        getAllNotice() {
            this.$post('api/matter/notice/get', {
                matterId: this.$route.query.matterId,
                mustPutAway: true,
                returnContent: true
            }).then( res => {
                if ( res.err_code === '0' ) {

                    // 为了兼容老版本的须知项，手动为通用项添加type
                    // 同时对text类型的富文本的base64解码
                    this.noticeList = res.body.map( item => {
                        if ( item.isSpecial === 'N' ) {
                            if ( item.code === 'desc' || item.code === 'condition' || item.code === 'steps' ) {
                                item.type = 'text';
                                item.content = item.content ? Base64.decode(item.content) : '';
                            }
                            else if (item.code === 'data') {
                                item.type = 'sample';
                            }
                            else if ( item.code === 'tables' ) {
                                item.type = 'file';
                            }
                            else if ( item.code === 'policies' ) {
                                item.type = 'link';
                            }
                            else {}
                        }
                        else {
                            item.content = item.content ? Base64.decode(item.content) : '';
                        }
                        return item;
                    });
                }

                this.$nextTick( () => {
                    this.setBlockDefaultHeight();
                });
            });
        },

        /*
         * 由于每一个模块需要展开或收缩，首先设置期默认展开高度
        */
        setBlockDefaultHeight() {
            const clientHeight = document.documentElement.clientHeight;
            this.$refs.itemBlockContent.forEach( (item, index) => {
                let _vhHeight = item.scrollHeight / clientHeight * 100;
                this.expandStatus.push(true);
                this.showExpandBar.push(false);

                if ( _vhHeight > gHeight ) {
                    // 是否展开状态
                    this.expandStatus[index] = false;

                    // 是否显示展开bar
                    this.showExpandBar[index] = true;

                    // 根据内容高度和是否展开，设置初始高度
                    this.$refs.itemBlockContent[index].style.height = `${gHeight}vh`;
                }
            });
        },

        /*
         * 获取事项所属的委办局的信息
        */
        getGovInfo() {
            this.$get(`api/free/matter/government/${this.$route.query.matterId}`).then( res => {
                if ( res.err_code === '0' ) {
                    this.govTel = res.body.telphone;
                    this.govAddress = res.body.address;
                    this.govPos.lat = res.body.lat;
                    this.govPos.lng = res.body.lng;
                }
            });
        },

        /*
         * 获取办理材料
        */
        getSamples() {
            // this.$post(`api/matter/trees/${this.$route.query.matterId}`).then( res => {
            //     if ( res.err_code === '0' ) {
            //         // 将res.body.trees.swatches合并，并去重，作为办理材料
            //         let _samplesList = [];
            //         let obj = {};  // 去重用的中间记录对象
            //         res.body.trees.forEach( item => {
            //             _samplesList.push( ...item.swatches );
            //         });
            //
            //         _samplesList.forEach( item => {
            //             if ( !obj[item.id] ) {
            //                 this.samplesList.push(item);
            //                 obj[item.id] = true;
            //             }
            //         });
            //     }
            // });
          this.$post('api/matter/trees/' + this.$route.query.matterId).then(({body}) => {
            this.matterName = body.matter.name;
            document.title = this.matterName;
            this.matterTreeData = body.trees;
            if (this.matterTreeData.length === 1) {
              if (this.matterTreeData[0].isGroup === 'Y') {
                this.groupList.push(this.matterTreeData[0]);
              } else {
                this.$alert('未配置组合, 请重新配置事项数据.').finally(() => {
                  if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
                    wx.miniProgram.navigateBack({
                      delta: 1
                    });
                  } else {
                    window.location.href = this.baseUrl + '/backIndex';
                  }
                });
              }
            } else {
              let root = this.getRoot(0);
              let schema = [];
              schema.push(this.transformTreeItem(root));
              this.schema = schema;
            }
          });
        },

        /*
         * 拨打事项所属委办局的电话
        */
        call(telNo) {
            let strTelNo = `tel:${telNo}`;
            if ( this.$route.query.device === 'ios') {
                window.webkit.messageHandlers.callTel.postMessage({
                    "callTel": telNo
                });
            }
            else if ( this.$route.query.device === 'android' ) {
                // let _tel = telNo.replace('-', '');
                native.callTel(telNo);
            }
            else if ( this.$route.query.device === 'xcx' ) {
                if ( this.govTel ) {
                    window.location.href = strTelNo;
                }
            }
            else {}
        },

        /*
         * 调用手机端的导航
         * @param pos: 事项所属委办局的经纬度
         * @param native: android提供的类名
         * @param sendData: android和ios提供的方法
        */
        navigate(pos, adress) {
            let navData = {
                lat: pos.lat,
                lng: pos.lng,
                address: adress
            };
            let url = `/pages/main/showMap/showMap?longitude=${pos.lng}&latitude=${pos.lat}&name=${''}&address=${adress}`;

            if ( this.$route.query.device === 'ios') {
                window.webkit.messageHandlers.sendData.postMessage({
                    "sendData": JSON.stringify(navData)  // call
                });
            }
            else if ( this.$route.query.device === 'android' ) {
                native.sendData(JSON.stringify(navData));
            }
            else if ( this.$route.query.device === 'xcx' ) {
                wx.miniProgram.navigateTo({url: url});
            }
            else {}
        },

        /*
         * 跳转到样本详情
        */
        querySample(sample) {
            let _query = Object.assign({}, sample, {device: this.$route.query.device, matterName: this.matterName});
            this.$router.push({
                path: '/samplePreview',
                query: _query
            });
        },
        createMatter() {
          let flattenArr = [];
          this.flattenSchema(this.schema, flattenArr);
          let userTree = flattenArr.filter(each => this.content[each.id] instanceof Array ? this.content[each.id].length : this.content[each.id]).map(each => {
            let obj = this.objMapping[each.id];
            return {
              matterTreeId: obj.id,
              value: this.content[each.id] instanceof Array ? this.content[each.id].join(',') : this.content[each.id],
            };
          });
          let query = {
            matterId: this.$route.query.matterId,
            userTree: JSON.stringify(userTree),
          };
          this.$router.replace({
            path: '/matterTree',
            query: query,
          });
        },
      transformTreeItem(item) {
        if (item.isGroup === 'Y') {
          return undefined;
        }
        let formItem = {
          id: this.generateId(item),
          type: item.itemType ? item.itemType : 'radio',
          label: item.itemName,
        };
        if (item.reminder) {
          formItem.tip = item.reminder;
        }
        if (item.title && item.describe) {
          let helpObj = {
            title: item.title,
            content: item.describe,
          };
          formItem.helpLink = helpObj;
        }
        let children = this.matterTreeData.filter(child => child.parentId === item.id);
        formItem.items = children.map(child => {
          return {
            id: this.generateId(),
            label: child.treeName,
            value: child.treeName,
          };
        });
        // let value = '';
        // let match = this.userMatterTreeData.filter(oldItem => oldItem.matterTreeId === item.id);
        // let parentMatch = this.userMatterTreeData.filter(oldItem => oldItem.matterTreeId === item.parentId && oldItem.value);
        // if (match.length && (item.parentId === 0 || parentMatch.length) && !(formItem.type !== 'checkbox' && match[0].value.includes(','))) {
        //   value = match[0].value;
        // }
        // if (formItem.type === 'checkbox') {
        //   value = value ? value.split(',') : [];
        // }
        // this.$set(this.content, formItem.id, value);
        return formItem;
      },
      diffContent(oldVal, newVal) {
        let result = {
          add: {},
          remove: {},
          replace: {},

        };
        Object.keys(oldVal).forEach(key => {
          if (newVal.hasOwnProperty(key)) {
            if (JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key])) {
              result.replace[key] = {
                old: oldVal[key],
                new: newVal[key],
              };
            }
          } else {
            result.remove[key] = oldVal[key];
          }
        });
        Object.keys(newVal).filter(key => !oldVal.hasOwnProperty(key)).forEach(key => {
          result.add[key] = newVal[key];
        });
        return result;
      },
      processTree(oldVal, newVal) {
        let result = this.diffContent(oldVal, newVal);
        if (Object.keys(result.add).length) {
          this.processAdd(result.add);
        }
        if (Object.keys(result.replace).length) {
          Object.keys(result.replace).forEach(key => {
            this.removeRecursive([key]);
            this.processAdd({[key]: result.replace[key].new});
          });
        }
      },
      processAdd(addObj) {
        Object.keys(addObj).forEach(key => {
          let parentSchema = this.getSingleSchemaById(this.schema, key);
          if (parentSchema) {
            let children = this.matterTreeData.filter(child => child.parentId === this.objMapping[key].id);
            let list;
            if (Object.prototype.toString.call(addObj[key]) === '[object Array]') {
              list = addObj[key];
            } else {
              list = [addObj[key]];
            }
            let add = children.filter(child => list.includes(child.treeName));
            if (add.length) {
              let subSchemaList = [];
              let groupList = [];
              add.forEach(each => {
                let subChildren = this.matterTreeData.filter(child => child.parentId === each.id);
                if (each.isGroup === 'Y') {
                  groupList.push(each);
                } else if (subChildren.length) {
                  let schemaAdd = this.transformTreeItem(each);
                  subSchemaList.push(schemaAdd);
                  if (this.controlMapping[key]) {
                    this.controlMapping[key].push(schemaAdd.id);
                  } else {
                    this.$set(this.controlMapping, key, [schemaAdd.id]);
                  }
                }
              });
              this.$set(parentSchema, 'children', subSchemaList);
              let tempList = Array.from(this.groupList);
              tempList.push(...groupList);
              this.groupList = Array.from(new Set(tempList));
            }
          }
        });
      },
      removeRecursive(keys) {
        keys.forEach(key => {
          if (this.controlMapping[key]) {
            this.removeRecursive(this.controlMapping[key]);
            delete this.controlMapping[key];
          } else {
            let obj = this.objMapping[key];
            let children = this.matterTreeData.filter(child => child.parentId === obj.id);
            children.filter(each => each.isGroup === 'Y').forEach(each => {
              let index = this.groupList.findIndex(item => item.id === each.id);
              this.groupList.splice(index, 1);
            });
          }
        });
      },
      generateId(obj) {
        let newId;
        if (Object.prototype.toString.call(window.globalUniqueId) !== '[object Set]') {
          window.globalUniqueId = new Set();
        }
        do {
          newId = 'd' + Math.floor(Math.random() * (1<<30)).toString(36);
        } while (window.globalUniqueId.has(newId));
        window.globalUniqueId.add(newId);
        if (obj && obj instanceof Object) {
          this.objMapping[newId] = obj;
        }
        return newId;
      },
      getRoot(index) {
        let item = this.matterTreeData[index];
        if (item.parentId) {
          return this.getRoot(this.matterTreeData.findIndex(find => find.id === item.parentId));
        } else {
          return item;
        }
      },
      getSingleSchemaById(schemaList, itemId) {
        for (let each of schemaList) {
          if (each.children && each.children.length) {
            let result = this.getSingleSchemaById(each.children, itemId);
            if (result) {
              return result;
            } else if (each.id === itemId) {
              return each;
            }
          } else if (each.id === itemId) {
            return each;
          }
        }
        return false;
      },
      flattenSchema(schemaList, arr) {
        arr.push(...schemaList);
        schemaList.forEach(each => each.children && each.children.length && this.flattenSchema(each.children, arr));
      },
      getLegacyUserMatter() {
        this.$post('/api/app/matter/checkMatterStatus', {matterId: this.$route.query.matterId}).then(res => this.legacyUserMatter = res.body);
      },
      gotoMatterDetail() {
        let url;
        if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
          url = `${location.origin}/h5/#/userMatterDetail?matterId=${this.legacyUserMatter.matterId}&userMatterId=${this.legacyUserMatter.id}&token=${sessionStorage.getItem('token')}`;
        } else {
          url = `${this.baseUrl}/gotoDetail?userBusId=${this.legacyUserMatter.id}&matterId=${this.legacyUserMatter.matterId}`;
        }
        location.href = url;
      },
    },
  watch: {
    'groupList': {
      handler(val) {
        if (val.length) {
          let flattenArr = [];
          this.flattenSchema(this.schema, flattenArr);
          let store = {};
          flattenArr.forEach(each => {
            let obj = this.objMapping[each.id];
            if (obj.swatches && obj.swatches.length) {
              obj.swatches.forEach(child => store[child.id] = child);
            }
          });
          val.forEach(each => {
            if (each.swatches && each.swatches.length) {
              each.swatches.forEach(child => store[child.id] = child);
            }
          });
          this.samplesList = Object.keys(store).map(key => store[key]).map(each => {
            let regexp = /^https?:/;
            if (each.swatchUrl) {
              each.swatchUrl = each.swatchUrl.replace(regexp, location.protocol);
            }
            if (each.filePath) {
              each.filePath = each.filePath.replace(regexp, location.protocol);
            }
            return each;
          });
        } else {
          this.samplesList = [];
        }
      },
      deep: true,
    }
  },
};
