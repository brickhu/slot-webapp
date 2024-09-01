import * as aoconnect  from "@permaweb/aoconnect";
import { arGql, GQLUrls } from "./argql";


export const formatMessageTags = (tags) =>{
  if(tags instanceof Array){
    return tags.map(item=>{return {name:item[0],value:item[1]}})
  }else{
    const arr = Object.entries(tags)
    return arr.map(item=>{return {name:item[0],value:item[1]}})
  }
}

export const findTagItem = (key,arr) =>{
  return arr.find(item => item.name === key);
}

export const findTagItemValues = (keys,arr) =>{
  const res = []
  for (const key of keys) {
    const tag_obj = arr.find(item => item.name === key);
    res.push(tag_obj.value)
  }
  return res
}

export const hasTagItemMatched = (exp, arr) => {
  const keys = Object.keys(exp);
  return keys.every(key => {
    const matchedItem = arr.find(item => item.name === key);
    if (!matchedItem || matchedItem.value !== exp[key]) {
      return false;
    }
    return true;
  });
}

export function AoChain(params) {
  this.GATEWAY_URL = params?.nodes?.GATEWAY_URL || import.meta.env.VITE_GATEWAY_URL || "https://arweave.net"
  if(params?.nodes){
    this.aoconnect = aoconnect.connect({
      MU_URL: params?.nodes?.MU_URL || import.meta.env.VITE_MU_URL || "https://mu.ao-testnet.xyz",
      CU_URL: params?.nodes?.CU_URL || import.meta.env.VITE_CU_URL || "https://cu.ao-testnet.xyz",
      GATEWAY_URL: params?.nodes?.GATEWAY_URL || import.meta.env.VITE_GATEWAY_URL || "https://arweave.net",
    })
  }else{
    this.aoconnect = aoconnect
  }
  this.gql = arGql({endpointUrl:this.GATEWAY_URL?`${this.GATEWAY_URL}/graphql`: GQLUrls.arweave})
  this.wallet = params?.wallet
  this.scheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA"
  this.promise = Promise.resolve();
}

AoChain.prototype.next = function(task) {
  this.promise = this.promise.then(task);
  return this;
};

AoChain.prototype.then = function(onFulfilled, onRejected) {
  return this.promise.then(onFulfilled, onRejected);
};

AoChain.prototype.catch = function(onRejected) {
  return this.promise.catch(onRejected);
};

AoChain.prototype.message = function(params) {
  return this.next(async (_prev) => {
    this.process = params?.process || this.process
    this.wallet = params?.wallet || this.wallet
    const msg = await this.aoconnect.message({
      process: params?.process || _prev?.process || this.process,
      tags: params?.tags?formatMessageTags(params?.tags):[],
      data: params?.data || "",
      signer: aoconnect.createDataItemSigner(params?.wallet || this.wallet),
    })
    console.log("msg:",msg)
    if(!msg) throw("handle message() faild.")
    this.msg = msg
    return msg
  });
};

AoChain.prototype.result = function(params) {
  return this.next(async (_prev) => {
    const res = await this.aoconnect.result({
      process: params?.process || _prev?.process || this.process ,
      message: params?.message || _prev?.message || this.msg
    })
    // console.log(res)
    if(!res) throw("handle result() falid.")
    if(res.Error) throw(res.Error)
    this.res = res
    return res
  });
};

AoChain.prototype.results = function(params) {
  return this.next(async (_prev) => {
    const exp = {
      process: params?.process || _prev?.process || this.process,
      sort: params?.from || "ASC",
      limit: params?.limit || 25,
    }
    if(params?.from){
      exp.from = params?.from || 0
    }
    const list = await aoconnect.results(exp)
    if(!list) throw("handle results() falid.")
    this.list = list
    return list
  });
};

AoChain.prototype.spawn = function(params) {
  return this.next(async () => {
    this.module = params?.module || this.module
    this.scheduler = params?.scheduler || this.scheduler
    this.wallet = params?.wallet || this.wallet
    const process_id = await this.aoconnect.spawn({
      module: params?.module || this.module,
      scheduler: params?.scheduler || this.scheduler || "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
      signer: aoconnect.createDataItemSigner(params?.wallet || this.wallet),
      tags: params?.tags?formatMessageTags(params?.tags):[],
      data: params?.data || ""
    })
    if(!process_id) throw("handle spawn() faild.")
    localStorage.setItem("latest_spwaned",process_id)
    this.process = process_id
    return process_id
  });
};

AoChain.prototype.dryrun = function(params) {
  return this.next(async (_prev) => {
    this.process = params?.process || _prev?.process || this.process
    const res = await this.aoconnect.dryrun({
      process: params?.process || _prev?.process || this.process ,
      tags: params?.tags?formatMessageTags(params?.tags):[],
      data: params?.data || "",
      anchor: params?.anchor || ""
    })
    if(!res) throw("handle dryrun() falid.")
    if(res.Error) throw(res.Error)
    this.res = res
    return res
  });
};

AoChain.prototype.monitor = function(params) {
  return this.next(async (_prev) => {
    this.process = params?.process || this.process
    this.wallet = params?.wallet || this.wallet
    const monitor_process = await this.aoconnect.monitor({
      process: params?.process || this.process || _prev?.process,
      signer: aoconnect.createDataItemSigner(params?.wallet || this.wallet),
    })
    if(!monitor_process) throw("handle monitor() falid.")
    this.monitor_process = monitor_process
    return monitor_process
  });
};

AoChain.prototype.unmonitor = function(params) {
  return this.next(async (_prev) => {
    this.process = params?.process || this.process
    this.wallet = params?.wallet || this.wallet
    const unmonitor_process = await this.aoconnect.unmonitor({
      process: params?.process || this.process || _prev,
      signer: aoconnect.createDataItemSigner(params?.wallet || this.wallet),
    })
    if(!unmonitor_process) throw("handle unmonitor() falid.")
    this.unmonitor_process = unmonitor_process
    return unmonitor_process
  });
};

AoChain.prototype.getData = function({txid,parse}) {
  return this.next(async (_prev) => {
    const response =  await fetch(`${this.GATEWAY_URL}/${txid||_prev}`)
    const data = await response.text()
    return parse?JSON.parse(data):data
  });
};

AoChain.prototype.fetchAddressInbox = function(params) {
  return this.next(async (_prev) => {
    let results = await this.gql.run(`
      query{
        transactions(
          recipients: ["${params?.address||_prev?.address||this.address}"],
          tags: [{
              name: "Data-Protocol",
              values: ["ao"]
            },{
              name: "Variant",
              values: ["ao.TN.1"]
            },{
              name: "Type", 
              values: ["Message"]
            }]
        ) {
          edges {
            node {
              id
              tags {
                name,
                value
              }
              data {
                type
              }
            }
          }
        }
      }`);
    return results?.data.transactions?.edges
  });
};


AoChain.prototype.query = function(query) {
  
  return this.next(async (_prev) => {
    console.log('query: ', query || _prev);
    let results = await this.gql.run(query||_prev||'');
    return results?.data.transactions?.edges
  });
};

