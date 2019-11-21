# 利用注解和反射轻松解决项目遇到的困难

1. 最近在项目中碰到一个问题，后台返回的实体属性是通过mybatis映射来的，有些字段没有映射到就取到了默认的初始化值null。但是前端采用Layui的table模块，对于后台传回来的null值会报错。

   ``` html
    cols: [
               [{type: 'radio',fixed: 'left'},
                   {field: 'id',title: 'ID',width: 80,fixed: 'left',unresize: true,sort: true,fixed:true,totalRowText: '合计'},
                   {field: 'name',title: '房源名',width: 300},
                   {field: 'price',title: '价格',width: 150},
                   {field: 'cash',title: '押金',width: 150},
                   {field: 'collectCount',title: '收藏数',width: 80,sort: true,totalRow: true},
                   {field: 'province',title: '省份',width: 80,sort: true},
                   {field: 'city',title: '城市',width: 80,sort: true},
                   {field: 'area',title: '区域',width: 120,sort: true},
                   {field: 'street',title: '街道',width: 120,sort: true},
                   {field: 'homeNo',title: '门牌号',width: 120,sort: true},
                   {field: 'type',title: '房屋类型',width: 100,sort: true,totalRow: true},
                   {field: 'pushTime',title: '发布时间',width: 160,templet : "<div>{{layui.util.toDateString(d.pushTime, 'yyyy-MM-dd HH:mm:ss')}}</div>"},
                   {fixed: 'right',title: '操作',toolbar: '#barDemo',width: 80}
               ]],
   ```

   

   2.如上面代码，这种代码显然前端处理不了这种问题。那么我们只能通过后台来处理。既然返回null值不能处理，那么我们希望每一个字段能设置成为前端需要的值，比如0或者无这种可以展示给用户的值。我想到的是通过对对象的反射，取到对象的每一个字段，然后得到字段上面我们自定义的注解，通过给定注解的值，设置给字段，然后返回给前台。

   3.首先我们自定义我们的注解

   ```java
   @Target(value={ElementType.FIELD})
   @Retention(value=RetentionPolicy.RUNTIME)
   public @interface SetValue {
   	String value() default "";
   }
   
   ```

   4.创建一个Person类 get/set方法省略 在字段上面设置我们的注解值，这些值到时候会设置到属性上面

   ```java
   public class Person {
   	@SetValue(value="")
   	private String name;
   	@SetValue(value="true")
   	private Boolean flag ; //1
   	@SetValue(value="c")
   	private Character c ;//2
   	@SetValue(value="0")
   	private Byte b ;//1
   	//@SetValue(value="0")
   	private Short s ;//2
   	@SetValue(value="0")
   	private Integer id;//4
   	@SetValue("0")
   	private Long l ;//8
   	@SetValue("0.0")
   	private Float f ;//4
   	@SetValue("0.00")
   	private Double d ;//8
   }
   ```

   

5.创建工具方法

```java
package cn.maodun.test;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.junit.Test;

import cn.maodun.pojo.Person;
import cn.maodun.util.ReflectUtils;

public class TestReflect {
	
	public static void main(String[] args) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException {
		Person p = new Person() ;
		List<String> methodName = new ArrayList<String>() ;
		//p.setId(2);
		Class<? extends Person> class1 = p.getClass() ;
		
		List<Field> fields = ReflectUtils.getFields(class1,true,true,true,false) ;
		for (Field field : fields) {
			System.out.println(field.getName());
		}
		List<Method> methods = ReflectUtils.getMethods(class1,true,false,false) ;
		 List<String> findFieldsAddSetValueAnno = findFieldsAddSetValueAnno(p) ;
		for (Method method : methods) {
			for(int i = 0 ; i < findFieldsAddSetValueAnno.size() ;i++){
				if(TestReflect.changeFirstSmall(method.getName().substring(3,method.getName().length())).equals(findFieldsAddSetValueAnno.get(i))){
					if(method.getName().indexOf("get") >= 0 ){
						Object	invoke = method.invoke(p);
						if(invoke == "" || invoke== null){
							String mname = TestReflect.getMethodName(method.getName()) ;//setName
							methodName.add(mname) ;
						}
			}
					break ;
				}
			}
			
		}
		for (Method method : methods) {
			for(int i = 0 ; i < methodName.size() ; i++){
				if(method.getName().equals(methodName.get(i))){
					String field = TestReflect.changeFirstSmall(method.getName().substring(3,method.getName().length())) ; //属性
					String value = TestReflect.getFieldModifyValue(p,field ) ; //属性上面setValue注解value的值
					Class<?> parameterType = method.getParameterTypes()[0] ;
					if(parameterType == Boolean.class){
						if(value.equals(Boolean.TRUE.toString())){
							method.invoke(p, Boolean.TRUE) ;
						}else if(value.equals(Boolean.FALSE.toString())){
							method.invoke(p, Boolean.FALSE) ;
						}else{
							try {
								throw new MyException("@SetValue 上面Boolean类型的值设置错误") ;
							} catch (MyException e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
						}
					}else if(parameterType == Character.class){
						method.invoke(p, value.charAt(0)) ;
					}else if(parameterType == String.class){
						method.invoke(p, value) ;
					}else if(parameterType == Integer.class){
						method.invoke(p,Integer.valueOf(value)) ;
					}else if(parameterType == Long.class){
						method.invoke(p,Long.valueOf(value)) ;
					}else if(parameterType == Double.class){
						method.invoke(p,Double.valueOf(value)) ;
					}else if(parameterType == Short.class){
						method.invoke(p,Short.valueOf(value)) ;
					}else if(parameterType == Float.class){
						method.invoke(p,Float.valueOf(value)) ;
					}else if(parameterType == Byte.class){
						method.invoke(p, Byte.valueOf(value)) ;
					}
					break ;
				}
				
			}
		}
		System.out.println(p);
		}
	@Test
	public void testa(){
		/*String c = "c" ;
		System.out.println(c.charAt(0));*/
		/*Date d = new Date() ;
		List<String> list = new ArrayList<>() ;
		System.out.println(d.getClass()==Date.class);
		System.out.println( list.getClass() == List.class);*/
		/*String aa = "SetName" ;
		System.out.println(TestReflect.changeFirstSmall(aa));
		String bb = "setName" ;
		System.out.println(aa==bb);
		System.out.println(aa.substring(2,aa.length()));
		System.out.println(aa.indexOf("set"));
		System.out.println(TestReflect.getMethodName(aa));*/
		Person p = new Person() ;
		p.setName("aaa");
		try {
			Field field = p.getClass().getDeclaredField("name") ;
			field.setAccessible(true);
			try {
				System.out.println(field.get(p));
			} catch (IllegalArgumentException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IllegalAccessException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		} catch (NoSuchFieldException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SecurityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String aa = TestReflect.getFieldModifyValue(p, "name") ;
		System.out.println(aa);
	}
	
	/** get的方法变为set的方法
	 * @param methodName
	 * @return
	 */
	public static String getMethodName(String methodName){ 
		return "s" + methodName.substring(1, methodName.length()) ;
	}
	
	/** 获取某个对象的特定属性上面的value值
	 * @param o
	 * @param field
	 * @return
	 */
	public static String getFieldModifyValue(Object o,String field){
		Field[] fields = o.getClass().getDeclaredFields() ;
		for (Field f : fields) {
			if(f.getName().equals(field)){ //属性相等
				SetValue setValue = f.getAnnotation(SetValue.class) ;
				return setValue.value() ;
				/*Annotation[] annotations = f.getAnnotations() ;
				for (Annotation annotation : annotations) {
					if(annotation.getClass()==SetValue.class){
						annotation.
					}
				}*/
			}
		}
		return null;
	}
	
	/** 改变首字母小写
	 * @param s
	 * @return
	 */
	public static String changeFirstSmall(String s){
		if(Character.isLowerCase(s.charAt(0)))
		    return s;
		  else
		    return (new StringBuilder()).append(Character.toLowerCase(s.charAt(0))).append(s.substring(1)).toString();
	}
	/**得到某个对象的属性上面有setValue注解的属性集合
	 * @param o
	 * @return
	 */
	public static List<String> findFieldsAddSetValueAnno(Object o){
	List<String> list = new ArrayList<>();
		Class<? extends Object> class1 = o.getClass() ;
		List<Field> fields = ReflectUtils.getFields(class1,true,true,true,false) ;
		for(int i = 0 ; i < fields.size() ;i++){
			if(fields.get(i).getAnnotation(SetValue.class)!=null){
				list.add(fields.get(i).getName()) ;
				//System.out.println(fields.get(i).getName());
 			}
		}
		return list ;
	}
	@Test
	public void test2(){
		  List<String> findFieldsAddSetValueAnno = TestReflect.findFieldsAddSetValueAnno(new Person()) ;
		System.out.println(findFieldsAddSetValueAnno);
	}
}
```

6.输出结果 Person [name=, flag=true, c=c, b=0, s=null, id=0, l=0, f=0.0, d=0.0] 可以看出这个对象的值已经设置成为我们想要的值了，而不是它的初始化值。到此就解决了我们的问题。虽然，这种东西有很多很好的开源代码，但是自己能尝试着去实现，不仅提高了基础，还能更好的感受到其中的原理。

7.最后放到项目中，发现解决了项目的问题。