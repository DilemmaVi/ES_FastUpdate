  new Vue({
      el: '#app',
      data: function() {
      let items=[];
      let selectIndex="";
      this.indexList();
      return {
        hasInput:false,
        dialogTitle:"",
        input:"",
        field:"",
        fieldType:"",
        selectIndex:selectIndex,
        tableData: [],
        items:items,
        bodyStyle:"height:"+(document.documentElement.clientHeight-20) +"px"+";border: 1px solid #eee",
        formLabelWidth: '120px',
        dialogFormVisible: false,
        editData:""
          
      }
      },
      
      mounted () {
            var self=this;
            window.onresize = () => {
                return (() => {
                    self.bodyStyle = "height:"+(document.documentElement.clientHeight-20) +"px"+";border: 1px solid #eee"
                })()
            }
        },
      
      watch:{
          input:function(){
                this.hasInput=false;
          }
      },
      methods:{
          indexList:function(){
              var self=this;
              axios.get('/indexList')
              .then(function (response) {
                 self.items=response.data
              })
              .catch(function (error) {
                cself.showAlert('error','网络请求失败')

              });      
          },
                    
        get_tableData:function(index,id){
               var self=this;
            axios.post('/tableData', {
                index: index,
                id: id
              })
              .then(function (response) {
              if(response.data=="noData"){
                  self.$alert("未查询到数据")
              }else{
               self.tableData=response.data;
               self.hasInput=true
               }
              })
              .catch(function (error) {
               self.showAlert('error','网络请求失败')
              });      
          },
          
        selectIndexMethod:function(e){
             this.selectIndex=e.$el.innerText;  
             this.tableData=[]; 
             this.input="";    
        },
        
        check:function(){
            let index=this.$refs.indexName.innerText;
            if(index==""){
             this.$alert("请先选中需要处理的索引","",{type:"warning"})
            return
            };
            if(this.input==""){
             this.$alert("请输入需要查询的_id值","",{type:"warning"})
            return            
            };  
            this.get_tableData(index,this.input)
            
        },
            
        delData:function(){
            let self=this
            this.$prompt("请输入'删除'，此操作无法恢复，请谨慎操作", '提示', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      inputValidator: function(val){if(val=="删除"){return true}else{return false}},
                      inputErrorMessage: '输入不正确'
                    }).then(({ value }) => {
                    axios.post('/delData', {
                        index: self.$refs.indexName.innerText,
                        id: self.input
                      })
                      .then(function (response) {
                        if(response.data=="ok"){
                         self.tableData=[]; 
                         self.showAlert('success','删除成功')    
                      }else{
                        self.showAlert('error','删除失败，请查验是否有此数据')      
                          }
                            
                        })
                      .catch(function (error) {
                         self.showAlert('error','网络请求失败')
                      });  
                    }).catch(() => {
                      this.$message({
                        type: 'info',
                        message: '取消输入'
                      });       
                    });
   
        },
        handleEdit:function(data){
            console.log(data)
            this.editData=data.value
            this.field=data.key
            this.fieldType=data.type
            this.dialogTitle="正在修改索引为"+this.selectIndex+"字段为"+data.key+"的值"
            this.dialogFormVisible=true
        },
        
        updateData:function(){
            let self=this
            axios.post('/updateData', {
                index: self.$refs.indexName.innerText,
                id: self.input,
                filed:self.field,
                fieldType:self.fieldType,
                editData:self.editData
              })
              .then(function (response) {
                    if(response.data=="ok"){
                     self.get_tableData(self.$refs.indexName.innerText,self.input); 
                     self.dialogFormVisible=false
                     self.showAlert('success','更新成功')    
                  }else{
                    self.showAlert('error','更新失败，请查验数据是否正确')      
                      }
                })
              .catch(function (error) {
                 self.showAlert('error','网络请求失败')
              });             
        },
            
            
        showAlert:function(type,message){
            this.$message({
            type: type,
            message: message
         });            
        }
      }
    })