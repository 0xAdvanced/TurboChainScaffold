module counter::counter {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// Counter对象
    struct Counter has key {
        id: UID,
        value: u64,
        owner: address,
    }

    /// 创建新的计数器
    public entry fun create(ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            value: 0,
            owner: tx_context::sender(ctx),
        };
        transfer::transfer(counter, tx_context::sender(ctx));
    }

    /// 增加计数器的值
    public entry fun increment(counter: &mut Counter, _ctx: &mut TxContext) {
        counter.value = counter.value + 1;
    }

    /// 减少计数器的值
    public entry fun decrement(counter: &mut Counter, _ctx: &mut TxContext) {
        if (counter.value > 0) {
            counter.value = counter.value - 1;
        }
    }

    /// 重置计数器的值
    public entry fun reset(counter: &mut Counter, ctx: &mut TxContext) {
        assert!(counter.owner == tx_context::sender(ctx), 0);
        counter.value = 0;
    }

    /// 获取计数器的当前值
    public fun value(counter: &Counter): u64 {
        counter.value
    }
}