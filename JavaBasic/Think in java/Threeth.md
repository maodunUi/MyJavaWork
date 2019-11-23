# String字符串分析

1.代码

```java
public class One {
    public static void main(String[] args) {
        String mango ="mango" ;
         String s = "abc" + mango + "def" + 47;
        System.out.println(s);
    }
}
```

2.javap -c One反编译字节码

```java
 public static void main(java.lang.String[]);
    Code:
       0: ldc           #2                  // String mango  把mango推送到栈顶
       2: astore_1     //把栈顶应用型数值存入本地变量
       3: new           #3                  // class java/lang/StringBuilder
       6: dup
       7: invokespecial #4                  // Method java/lang/StringBuilder."<init>":()V
      10: ldc           #5                  // String abc   将 int， float 或 String 型常量值从常量池中推送至栈顶。
      12: invokevirtual #6                  // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
      15: aload_1                            //将第二个引用类型局部变量推送至栈顶。
      16: invokevirtual #6                  // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
      19: ldc           #7                  // String def
      21: invokevirtual #6                  // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
      24: bipush        47                   //将单字节的常量值（-128~127） 推送至栈顶
      26: invokevirtual #8                  // Method java/lang/StringBuilder.append:(I)Ljava/lang/StringBuilder;
      29: invokevirtual #9                  // Method java/lang/StringBuilder.toString:()Ljava/lang/String;
      32: astore_2
      33: getstatic     #10                 // Field java/lang/System.out:Ljava/io/PrintStream;
      36: aload_2
      37: invokevirtual #11                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
      40: return
}

```

3.复杂String操作，多用StringBuilder而不是String,虽然虚拟机会帮我们优化一下。

4.格式化输出

```
System.out.printf()  等价于 System.out.format()
```

5.Formatter类

```java
%[argument_index$][flags][width][.precision]conversion
```

6.转换

| d    | 整数型 | e    | 浮点 |
| ---- | ------ | ---- | ---- |
| c    |        | x    |      |
| b    |        | h    |      |
| s    |        | %    |      |
| f    |        |      |      |

7.一个十六进制存储dump工具

8.正则表达式

```

```

