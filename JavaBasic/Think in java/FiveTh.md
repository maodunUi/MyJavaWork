# java 泛型擦除 通配符? 的思考 T与？擦除，协变

###     # 先看代码

```java
public class ErasedTypeEquivalence {
    public static void main(String[] args) {
        Class c1 = new ArrayList<String>().getClass() ;
        Class c2 = new ArrayList<Integer>().getClass() ;
        System.out.println(c1 == c2);
    }
}
//true  一个装有String类型的list 与 一个装有Integer类型的list 他们的class对象是相等的。看下面代码看看他们为什么会相等
```

```java
public class LostInformation {
    public static void main(String[] args) {
        ArrayList<Frob> list = new ArrayList<>() ;
        HashMap<Frob,Fnorkle> map = new HashMap<>() ;
        Quark<Fnorkle> quark = new Quark<>() ;
        Particle<Long,Double> p = new Particle<>() ;
        System.out.println(Arrays.toString(list.getClass().getTypeParameters()));
        System.out.println(Arrays.toString(map.getClass().getTypeParameters()));
        System.out.println(Arrays.toString(quark.getClass().getTypeParameters()));
        System.out.println(Arrays.toString(p.getClass().getTypeParameters()));
    }
}
class Frob{}
class Fnorkle{}
class Quark<Q>{}
class Particle<Position,Momentum>{}

//[E]
//[K, V]
//[Q]
//osition, Momentum]
//残酷的现实是 在泛型代码内部，无法获得有关泛型参数类型的信息。这就是泛型擦除。

```

### 思考 class A < T extends B> 与 class A{public B b ;}这两者有什么区别，看下面代码

```java
class HasF{
    public void f(){
        System.out.println("f()");
    }
}
```

```java
public class Mainpulator2 <T extends HasF>{
    private T obj ;

    public Mainpulator2(T obj) {
        this.obj = obj;
    }
    public void manipulate(){
        obj.f();
    }
}

```

```java
public class Manipulatore3 {
    private HasF obj ; //持有HasF对象及其子类型的对象 与上面的代码起到了相同作用，那么为什么还要有 <T extends HasF>语法呢

    public Manipulatore3(HasF obj) {
        this.obj = obj;
    }
    public void manipulate(){
        obj.f(); 
    }
}

```

我们可以看到Mainpulator2类是持有HasF类型以及HasF的子类型.但是你会发现Manipulatore3类持有HasF对象及其子类型的对象 与上面的代码起到了相同作用，那么为什么还要有 <T extends HasF>语法呢？

```java
public class ReturnGenericType<T extends HasF> {
    private T obj ;

    public ReturnGenericType(T obj) {
        this.obj = obj;
    }
    public T get(){ //当类是使用<T extends HasF>泛型时，返回T能得到具体的类型
        return obj ;
    }
}

```

如果一个类有一个返回T的方法，那么泛型就有所帮助。因为他们能返回确切的类型。

### 擦除的补偿(有些难度，需要多看几遍)

擦除丢失了代码执行的哪些能力呢?

```java
public  class Erased<T> {
    private final int size = 100 ;
    public  void f(Object arg){
        //if (arg instanceof T){} ; //error
      //  T var = new T() ; //error
      //  T[] array = new T[size] ; //error
        T[] array = (T[]) new Object[size]; //unchecked warining
    }
}

```

### 通配符<?> 

首先思考下List 、 List< Object> 、 List<?>区别

```java
  public static void main(String[] args) {
      //第一段:泛型出现之前的集合定义方式  这种方式大家可以看出来，a1可以添加不同的类型对象进去。但是这个有个问题，就是取出来的时候要转型。因此，泛型这个概念就出来了。
        List a1 = new ArrayList() ;
        a1.add(new Object()) ;
        a1.add(new Integer(1)) ;
        a1.add(new String("123")) ;
        //第二段:这种赋值很好理解，也没有什么疑惑。
        List<Object> a2 = a1 ;
        a2.add(new Object()) ;
        a2.add(new Integer(222)) ;
        a2.add(new String("123")) ;
        //第三段：下面的赋值居然可以成功。这是不是有些吃惊。a1是可以持有不同类型对象的，怎么可以赋值给一个持有Integer类型的List的呢？这是因为，由于泛型在JDK1.5之后出现，考虑到向前兼容，所以历史代码有时候需要赋值给新泛型代码。但是显然这种情况很反人类。而且也会出现问题。
        List<Integer> a3 = a1 ;
        a3.add(new Integer(123)) ;
        //a3.add(new Object()) ;
        //a3.add(new String("123")) ;
        //第四段:先不说明，请看下面的例子后再解释
        List<?> a4 = a1 ;
        a1.remove(0) ;
        a4.clear(); 
        //a4.add(new Object()) ;
    }
```

前面我们说到第二段，第三段这种赋值方式可以编译，是历史遗留问题。所以肯定不推荐这种方式了。那么把

 List a1 = new ArrayList() ;改成List<Integer> a1 = new ArrayList<Integer>可以吗？

```java
  List<Integer> a1 = new ArrayList<Integer>() ;
       // a1.add(new Object()) ;
        a1.add(new Integer(1)) ;
      //  a1.add(new String("123")) ;

        List<Object> a2 = a1 ;
```

经过测试这种方式是不行的。这里就引出了协变类型的概念。协变类型在数组是可以的。也就是说数组可以这样赋值。而集合不是，所以这里赋值发生错误。

那有时候我们想要把一个List< Integer>的引用赋值给一个List< Object>的引用这个时候怎么办呢？那么就出现了< ?>通配符了。这里就可以解释第四段了，而且也可以解释java中为什么会有< ?>通配符了。 List< ?> a4 = a1 ;有了通配符就可以这样赋值了。

### 通配符有三种 <?> <? extends T> <? super T> 

这三种类型，可能不会很容易真正的理解他们。你要记得一点是，这三种方式定义出来的引用可以赋值不同的对象。而能赋值不同的对象，也就是上面讲到的为什么会有通配符出现。怎么赋值在看下面的代码

```java
 public static void main(String[] args) {
        List<Animal> animals = new ArrayList<Animal>() ;
        List<Cat> cats = new ArrayList<Cat>() ;
        List<Garfield> garfields = new ArrayList<Garfield>() ;

        animals.add(new Animal()) ;
        cats.add(new Cat()) ;
        garfields.add(new Garfield()) ;
		//出错，只能赋值Cat或者Cat的子类
     //   List<? extends Cat> extendsCatFormAnimal = animals ;
        List<? super Cat> superCatFormAnimal = animals ;

        List<? extends Cat> extendsCatFormCat = cats ;
        //List<? super Cat> superCatFormGarfield = garfields ;
        //添加操作全部失效。这里可能你会有很大的疑问。下面第一行很容易理解。但是第二行第三行就难理解了。这里还是得回到我上面说的通配符是为了解决什么出现的。extendsCatFormCat 引用可以赋值cats。也可以赋值持有Cat或者Cat子类型的列表。什么意思呢？这个引用以后可以改变的。  List<? super Cat> superCatFormAnimal = animals。也可以  List<? super Cat> superCatFormAnimal = new ArrayList<Garfield>() ;既然引用可以赋值给不同的子类对象的列表。那么你用引用添加new Cat()是不行的。那添加new Garfield()也是不行的。因为如果有 Garfield类的子类。同样， List<? super Cat> superCatFormAnimal = new ArrayList<Garfield类的子类>() 。即superCatFormAnimal这个引用不知道它将来会赋值到什么对象的列表。有点类似下限的感觉。
        //extendsCatFormCat.add(new Animal()) ;
        //extendsCatFormCat.add(new Cat()) ;
        //extendsCatFormCat.add(new Garfield()) ;
        
        //superCatFormAnimal.add(new Animal());
        superCatFormAnimal.add(new Cat()) ;
        superCatFormAnimal.add(new Garfield()) ;

        Cat cat = extendsCatFormCat.get(0);
        Object o = extendsCatFormCat.get(0) ;
    }

class Animal{
}
class Cat extends Animal{
}
class Garfield extends Cat{
}

```

<? extend T> <? super T>这两个。前一个不能添加，后一个不能取出。即GetFirst 合PutFirst.

参考链接：

 https://www.cnblogs.com/jpfss/p/11726868.html 

 https://blog.csdn.net/margin_0px/article/details/82906596 

 https://www.cnblogs.com/wxw7blog/p/7517343.html 

参考书籍:

thinking in java 

码出高效java开发手册。

### 有问题，下面留言讨论。

