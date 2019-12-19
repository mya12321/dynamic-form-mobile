<template>
  <div class="outer-wrapper">
    <div class="form-wrapper">
      <!--<div class="matter-name">-->
        <!--<span>{{matterName}}</span>-->
      <!--</div>-->
      <div>
        <div v-if="schema.length">
          <div class="desc-first">请选择办事情形</div>
          <div class="desc-second">请根据您的自身情况进行选择</div>
          <DynamicForm2 :schema="schema" :content="content" :rule="rule" @change="processTree" ref="form"></DynamicForm2>
        </div>
        <div v-else-if="samplesList.length">
          <div class="desc-first">线上办理需要准备的材料</div>
          <div class="desc-second">提前准备好以下材料, 可方便办理</div>
        </div>
        <div class="sample_block" v-if="samplesList.length">
          <div class="samples">
            <div
              class="sample_item"
              v-for="(item, index) in samplesList"
              :key="index"
              @click.stop="querySample(item)"
            >
              <div class="item name">{{item.swatchName}}</div>
              <div class="item query">
                查看&nbsp;&gt;
              </div>
            </div>
          </div>
        </div>
        <div class="sample_block" v-else-if="groupList.length">
          <span class="sample_empty_text" v-if="!schema.length">该事项无需选择类型，请点击“下一步”，立即填写事项表格</span>
        </div>
        <div class="sample_block" v-else>
          <span class="sample_empty_text">请先完成选择, 选择完成后将会呈现办理材料</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import DynamicForm2 from '@/components/DynamicForm2.vue';

  export default {
    name: 'MatterTree',
    data() {
      return {
        stepIndex: 0,
        schema: [],
        content: {},
        rule: {},
        matterTreeData: [],
        userMatterTreeData: [],
        groupList: [],
        userMatterData: {},
        referenceData: {},
        formData: {},
        subFormData: {},
        stepData: [],
        objMapping: {},
        controlMapping: {},
        dialogVisible: false,
        dialogImageUrl: '',
        hiddenForm: false,
        resultList: [],
        finalCommit: false,
        isMultiple: false,
        formIndex: 1,
        submissionType: '',
        submissionTitle: '',
        submissionLink: '',
        noTree: false,
        buttonList: [],
        samplesList: [],
      };
    },
    props: ['matterId', 'userMatterId', 'matterName', 'userId', 'prePage'],
    mounted() {
      this.$emit('stepActiveChange', 0);
      if (this.matterId && this.userMatterId) {
        this.init();
      }
    },
    activated() {
      if (this.buttonList.length) {
        if (this.groupList.length) {
          let flattenArr = [];
          this.flattenSchema(this.schema, flattenArr);
          let store = {};
          flattenArr.forEach(each => {
            let obj = this.objMapping[each.id];
            if (obj.swatches && obj.swatches.length) {
              obj.swatches.forEach(child => store[child.id] = child);
            }
          });
          this.groupList.forEach(each => {
            let leafNode = this.matterTreeData.filter(node => node.id === each.id)[0];
            if (leafNode && leafNode.swatches && leafNode.swatches.length) {
              leafNode.swatches.forEach(child => store[child.id] = child);
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
          this.$set(this.buttonList[0], 'status', 'edit');
          this.$emit('buttonChange', this.buttonList);
        } else {
          this.samplesList = [];
          this.$set(this.buttonList[0], 'status', 'disabled');
          this.$emit('buttonChange', this.buttonList);
        }
      }
    },
    components: {
      DynamicForm2
    },
    methods: {
      getRoot(index) {
        let item = this.matterTreeData[index];
        if (item.parentId) {
          return this.getRoot(this.matterTreeData.findIndex(find => find.id === item.parentId));
        } else {
          return item;
        }
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
      init() {
        let loading = this.$loading({
          lock: true,
          text: '正在加载',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        });
        let matterTree = this.$post('api/matter/trees/' + this.matterId);
        let userMatterTree = this.$post('api/user/tree/get/' + this.userMatterId);
        Promise.all([matterTree, userMatterTree]).then(res => {
          loading.close();
          this.matterTreeData = res[0].body.trees;
          this.userMatterTreeData = res[1].body;
          this.submissionType = res[0].body.matter.submissionType;
          this.submissionTitle = res[0].body.matter.submissionTitle;
          this.submissionLink = res[0].body.matter.submissionLink;
          let isNew = true;
          let commitButton = {
            id: this.generateId(),
            type: 'primary',
            text: '下一步',
            status: 'disabled',
            click: this.commit,
          };
          this.buttonList = [commitButton];
          // schema.buttons = buttons;
          this.$emit('buttonChange', this.buttonList);
          for (let node of this.userMatterTreeData) {
            if (node.matterTreeId && node.value) {
              isNew = false;
              break;
            }
          }
          if (isNew && this.$route.query.userTree) {
            this.userMatterTreeData = JSON.parse(this.$route.query.userTree);
          }
          if (this.matterTreeData.length === 1) {
            if (this.matterTreeData[0].isGroup === 'Y') {
              this.groupList.push(this.matterTreeData[0]);
              this.noTree = true;
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
            this.renderPage();
          }
        });
      },
      renderPage() {
        let root = this.getRoot(0);
        // let schema = {
        //   items: [],
        // };
        // schema.items.push(this.transformTreeItem(root));
        // let returnButton = {
        //   id: this.generateId(),
        //   type: 'primary',
        //   text: '返回',
        //   plain: true,
        //   click: this.goBack,
        // };
        let schema = [];
        schema.push(this.transformTreeItem(root));
        this.schema = schema;
      },
      commit() {
        let flattenArr = [];
        this.flattenSchema(this.schema, flattenArr);
        let treeData = flattenArr.map(each => {
          let obj = this.objMapping[each.id];
          let val = this.content[each.id];
          if (Object.prototype.toString.call(val) === '[object Array]') {
            val = val.join(',');
          }
          let newObj = {
            matterTreeId: obj.id,
            value: val,
            parentId: obj.parentId,
          };
          return newObj;
        });
        let groupData = this.groupList.map(each => each.group.id);
        groupData = Array.from(new Set(groupData));
        let loading = this.$loading({
          lock: true,
          text: '正在加载',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        });
        let saveUserTree = this.$post('api/user/tree/update/' + this.userMatterId, treeData);
        let saveGroup = this.$post('api/user/tree/group/add/' + this.userMatterId, groupData.map(groupId => {return {id: groupId}}));
        Promise.all([saveUserTree, saveGroup]).then(() => {
          let data = {
            matterId: this.matterId,
            userMatterId: this.userMatterId,
            submissionType: this.submissionType,
            submissionTitle: this.submissionTitle,
            submissionLink: this.submissionLink,
          };
          // if (this.noTree) {
          //   this.$router.replace({
          //     path: '/matterItem',
          //     query: data,
          //   });
          // } else {
          //   this.$router.push({
          //     path: '/matterItem',
          //     query: data,
          //   });
          // }
          this.$router.replace({
            path: '/matterItem',
            query: data,
          });
        }).catch(() => {
          loading.close();
          this.$alert('网络错误, 请重试.');
        });
      },
      goBack() {
        if (window.__wxjs_environment || navigator.userAgent.includes("miniProgram")) {
          wx.miniProgram.navigateBack({
            delta: 1
          });
        } else {
          window.location.href = this.baseUrl + '/backIndex';
        }
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
        let value = '';
        let match = this.userMatterTreeData.filter(oldItem => oldItem.matterTreeId === item.id);
        let parentMatch = this.userMatterTreeData.filter(oldItem => oldItem.matterTreeId === item.parentId && oldItem.value);
        if (match.length && (item.parentId === 0 || parentMatch.length) && !(formItem.type !== 'checkbox' && match[0].value.includes(','))) {
          value = match[0].value;
        }
        if (formItem.type === 'checkbox') {
          value = value ? value.split(',') : [];
        }
        this.$nextTick(() => this.$set(this.content, formItem.id, value));
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
        // if (Object.keys(result.remove).length) {
        //   this.processRemove(result.remove);
        // }
        if (Object.keys(result.replace).length) {
          Object.keys(result.replace).forEach(key => {
            // let children = this.matterTreeData.filter(child => child.parentId === this.objMapping[key].id);
            // let list;
            // if (Object.prototype.toString.call(result.replace[key].old) === '[object Array]') {
            //   list = result.replace[key].old;
            // } else {
            //   list = [result.replace[key].old];
            // }
            // let remove = children.filter(child => list.includes(child.treeName));
            // if (this.controlMapping[key]) {
            //   let tempObj = this.objMapping[key];
            //   this.processRemove({[key]: result.replace[key].old});
            //   this.objMapping[key] = tempObj;
            // } else if (remove.length) {
            //   remove.filter(each => each.isGroup === 'Y').map(each => {
            //     let index = this.groupList.findIndex(item => item === each.group.id);
            //     this.groupList.splice(index, 1);
            //   });
            // }
            this.removeRecursive([key]);
            this.processAdd({[key]: result.replace[key].new});
          });
        }
      },
      processAdd(addObj) {
        Object.keys(addObj).forEach(key => {
        let parentSchema = this.getSingleSchemaById(this.schema, key);
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
                // let index = this.schema.items.findIndex(schemaItem => schemaItem.id == key) + 1;
                // this.schema.items.splice(index, 0, schemaAdd);
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
        });
      },
      // processRemove(removeObj) {
      //   Object.keys(removeObj).forEach(key => {
      //     let children = this.matterTreeData.filter(child => child.parentId === this.objMapping[key].id);
      //     let list;
      //     if (Object.prototype.toString.call(removeObj[key]) === '[object Array]') {
      //       list = removeObj[key];
      //     } else {
      //       list = [removeObj[key]];
      //     }
      //     let remove = children.filter(child => list.includes(child.treeName));
      //     if (this.controlMapping[key]) {
      //       this.controlMapping[key].forEach(each => {
      //         this.$delete(this.content, each);
      //         this.$set(this.schema, 'items', this.schema.filter(schemaItem => schemaItem.id !== each));
      //       });
      //       delete this.objMapping[key];
      //       delete this.controlMapping[key];
      //     } else if (remove.length) {
      //       remove.filter(each => each.isGroup === 'Y').map(each => {
      //         let index = this.groupList.findIndex(item => item === each.group.id);
      //         this.groupList.splice(index, 1);
      //       });
      //     }
      //   });
      // },
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
      querySample(sample) {
        this.$router.push({
          path: '/samplePreview',
          query: Object.assign({}, sample, {matterName: this.matterName}),
        });
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
            this.$set(this.buttonList[0], 'status', 'edit');
            this.$emit('buttonChange', this.buttonList);
          } else {
            this.samplesList = [];
            this.$set(this.buttonList[0], 'status', 'disabled');
            this.$emit('buttonChange', this.buttonList);
          }
        },
        deep: true,
      },
    },
  }
</script>

<style scoped>
  .outer-wrapper {
    background-color: #f5f5f5;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .form-wrapper {
    margin: 0 auto;
    padding-bottom: 16px;
    width: calc(100vw - 32px);
    background-color: #f5f5f5;
    /*min-height: 600px;*/
  }
  .matter-name {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin: 0 24px;
    padding: 30px 0;
    border-bottom: 1px solid #f1f2f3;
  }
  .matter-name>span {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    line-height: 30px;
  }
  .desc-first {
    margin-top: 24px;
    font-size: 16px;
    color: black;
  }
  .desc-second {
    margin-top: 8px;
    font-size: 12px;
    color: #ccc;
  }
  .sample_block {
    background-color: white;
    padding: 24px 16px;
    margin-top: 4px;
  }
  .sample_block .title {
    font-size: 14px;
    color: #999;
    margin-bottom: 12px;
  }
  .sample_item {
    padding: 12px 16px;
    background-color: #f5f5f5;
    margin-bottom: 8px;
    border-radius: 4PX;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .sample_item .item {
    font-size: 14px;
  }
  .sample_item .name {
    flex: 8;
    color: #000;
  }
  .sample_item .query {
    flex: 2;
    text-align: right;
    color: #487fff;
  }
  .sample_item .query_disable {
    color: #666;
  }
  .sample_empty_text {
    display: inline-block;
    font-size: 14px;
    color: #ccc;
    width: 100%;
    margin: 32px 0;
    text-align: center;
  }
</style>
