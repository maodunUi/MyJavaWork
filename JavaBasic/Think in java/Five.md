# 初始化与清理(从jvm类加载解释static，final加载顺序，让你一次就懂)

### 先说基础结论

- static关键字不能应用于局部变量，因此它只能作用于域
- static域(静态变量)，static代码块只初始化一次
- 构造器实际上是静态方法(static修饰的方法)
- 初始化顺序:静态域(static代码块) > 变量 >  构造方法
- 父类>子类

### 类加载过程

加载 - 验证 - 准备 - 解析 - 初始化(5个阶段)

- 加载 是去加载.class文件的字节码
- 验证 对字节码是否是安全的做验证
- 准备 是初始化static域为默认值(参考下面表格)

```java
public static int value = 123 ; //这个阶段先是value = 0(默认值)
```

| boolean           | false |
| ----------------- | ----- |
| char              | []    |
| byte              | 0     |
| int               | 0     |
| long              | 0     |
| short             | 0     |
| float             | 0.0   |
| double            | 0.0   |
| reference（引用） | null  |



- 解析 将常量池里面符号引用替换为直接引用
- 初始化 对static域  和变量赋值。

```java
public static int value = 123 ; //这个阶段才是value = 123
public int vaule2 = 123 ;//经过两个阶段，显示vlaue2 = 0(默认值) 然后 value2 = 123
```



最后一个阶段初始化是在以下五种情况发生时会发生。(注定同时前四个阶段也会发生)

- new对象 (构造器实际上时static方法，因此相当于调用static方法了) 、引用static域或者static方法
- 反射调用
- 当初始化一个类的时候，发现其父类没有进行初始化，那么先触发其父类的初始化
- main方法
- 这种方式暂时还不懂 Class.forName()

```java
package MyInitialization;
//解析 首先对应上面的main方法 会发生初始化，发生初始化说明了经历了加载 - 验证 - 准备 - 解析 - 初始化(5个阶段)。而准备阶段  是初始化static域为默认值 。 初始化阶段是静态域 (static代码块) > 变量 >  构造方法。因此先执行static Table table = new Table() ; 碰到new实例，又要初始化Table类。
public class StaticInitialization {
    public static void main(String[] args) {
        System.out.println("Creating new Cupboard() in main"); //c : 10 Creating new Cupboard() in main
        new Cupboard() ; //d 注意Cupboard类已经初始化过一次，所以 static域(静态变量)，static代码块只初始化一次
        System.out.println("Creating new Cupboard() in main"); //f 13 Creating new Cupboard() in main
        new Cupboard() ; //g 重复d一样的过程 13 14 15
        table.f2(1); //h 16 f2(1)
        cupboard.f3(1); // i 17 f3(1)
    }
    static Table table = new Table() ; //a: 最先执行，初始化Table类
    static Cupboard cupboard = new Cupboard() ;//b: 接着执行 ，初始化Cupboard类
}
class Bowl{
    Bowl(int marker){
        System.out.println("Bowl(" + marker + ")");
    }
    void f1(int marker){
        System.out.println("f1(" + marker + ")");
    }
}

class Table{  //静态域 (static代码块) > 变量 >  构造方法
    static Bowl bowl1 = new Bowl(1) ; // 1 打印Bowl(1)
    Table(){
        System.out.println("Table()"); //3 Table()
        bowl2.f1(1); //4 f1(1)
    }
    void f2(int marker){
        System.out.println("f2(" + marker + ")");
    }
    static Bowl bowl2 = new Bowl(2) ; // 2 打印Bowl(2)
}
class Cupboard{ //静态域 (static代码块) > 变量 >  构造方法
     Bowl bowl3 = new Bowl(3) ; //7 Bowl(3) | 10 Bowl(3) （static域只初始化一次，所以只有bolw3才会再次赋值，因为在堆中又有一个对象啦）
    static Bowl bowl4 = new Bowl(4) ; // 5 Bowl(4)
    Cupboard(){
        System.out.println("Cupboard()"); //8 Cupboard() | 11 Cupboard()
        bowl4.f1(2); // 9 f1(2) | 12 f1(2)
    }
    void f3(int marker){
        System.out.println("f3(" + marker + ")");
    }
    static Bowl bowl5 = new Bowl(5) ; // 6  Bowl(5)
}

Bowl(1)
Bowl(2)
Table()
f1(1)
Bowl(4)
Bowl(5)
Bowl(3)
Cupboard()
f1(2)
Creating new Cupboard() in main
Bowl(3)
Cupboard()
f1(2)
Creating new Cupboard() in main
Bowl(3)
Cupboard()
f1(2)
f2(1)
f3(1)
```

还有值得注意的一点。当调用下面的static final修饰的域时，第一个不需要初始化，因为是编译器常量。第二个需要，因为不是编译器常量。

```java
static final int staicFinal = 47 ; //1
staic final int staticFinal2 = new Random().nextInt(47) ; //2
```



