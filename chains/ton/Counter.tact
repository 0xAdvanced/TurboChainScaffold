import "@stdlib/deploy";

// 计数器合约
contract Counter with Deployable {
    owner: Address;
    counter: Int as uint32;
    
    init() {
        self.owner = sender();
        self.counter = 0;
    }
    
    // 获取当前计数值
    get fun count(): Int {
        return self.counter;
    }

    // 获取拥有者
    get fun owner(): Address {
        return self.owner;
    }
    
    // 增加计数
    receive("increment") {
        self.counter = self.counter + 1;
    }
    
    // 减少计数
    receive("decrement") {
        if (self.counter > 0) {
            self.counter = self.counter - 1;
        }
    }
    
    // 重置计数
    receive("reset") {
        require(sender() == self.owner, "Only owner can reset");
        self.counter = 0;
    }
}