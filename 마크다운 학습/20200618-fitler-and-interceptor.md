Filter 에서 넘기고 HandlerInterceptor 에서 받고
====

다음과 같은 요구사항을 받고 처리한 과정을 정리한다.

# 요구사항

- 특정 API 호출시 접근이력(URL, 요청파라미터, 클라이언트 입력정보)을 남겨야 한다.

# 구현

스프링 웹애플리케이션에서 위 요구사항을 충족시킬 수 있는 방법을 고민하다가 `HandlerInterceptor`([https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerInterceptor.html](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerInterceptor.html)) 를 떠올렸다. 

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f4e605ec-9a14-4c43-ae48-b69e67f8eefc/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f4e605ec-9a14-4c43-ae48-b69e67f8eefc/Untitled.png)

우선은 API 호출정보를 기록할 지점을 선정하는데 사용할 애노테이션을 선언한다.

`PrivacyInfoAccess`

```java
import java.lang.annotation.*;

@Target({ElementType.TYPE, ElementType.METHOD}) // 클래스 혹은 메서드에 선언할 수 있다.
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PrivacyInfoAccess {

    /**
     * @return 민감정보항목(= 메뉴)
     */
    String name() default "";

    /**
     * @return 상세설명(= 수행업무명)
     */
    String description() default "";
}
```

이렇게 생성한 `PrivacyInfoAccess` 애노테이션을 원하는 컨트롤러 지점에 선언한다. 

```java
@RestController
public class GreetingController {

    @PrivacyInfoAccess(name = "GreetingController/get")
    @GetMapping("/greeting")
    public Greeting greeting(@RequestParam(defaultValue = "허니몬") String name) {
        return new Greeting("Hello, " + name);
    }

    @PrivacyInfoAccess(name = "GreetingController/post", description = "test")
    @PostMapping("/greeting")
    public Greeting postGreeting(@RequestBody Greeting greeting) {
        return greeting;
    }

    @Getter
    @NoArgsConstructor
    public static class Greeting {
        private String statement;

        public Greeting(String statement) {
            this.statement = statement;
        }
    }
}
```

이제 `HandlerInterceptor`를 구현하고 스프링에 등록한다.

`PrivacyInfoAccessHandlerInterceptor`

```java
import io.honeymon.training.programming.annotation.PrivacyInfoAccess;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Objects;

@Slf4j
@Component
public class PrivacyInfoAccessHandlerInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (handler instanceof HandlerMethod) {
            HandlerMethod targetHandler = (HandlerMethod) handler;
            PrivacyInfoAccess privacyInfoAccess = ((HandlerMethod) handler).getMethodAnnotation(PrivacyInfoAccess.class);
            if (Objects.isNull(privacyInfoAccess)) {
                privacyInfoAccess = AnnotatedElementUtils.findMergedAnnotation(((HandlerMethod) handler).getBeanType(), PrivacyInfoAccess.class);
            }

            if (Objects.nonNull(privacyInfoAccess)) { // 부합대상 확인
                log.debug("AccessInfo(Name: {}, Description: {})", privacyInfoAccess.name(), privacyInfoAccess.description());
                log.debug("URI: {} {}", request.getMethod(), request.getRequestURI());

                for (String parameterKey : request.getParameterMap().keySet()) {
                    log.debug("Parameter: (Key: {}, Value: {})", parameterKey, request.getParameter(parameterKey));
                }

                if(Arrays.asList("POST", "PUT").contains(request.getMethod())) {
                    log.debug("Body: {}", request.getAttribute("requestBody"));
                }
            }
        }

        return true;
    }
}
```

동작을 간단하게 설명하자면 웹요청이 있을 때마다 `PrivacyInfoAccessHandlerInterceptor` 를 거치게 되는데 이 과정에서 요청을 처리하는 핸들러(=Controller) 정보를 `handler` 를 이용해서 확인한다. 대상 핸들러에 `@PrivacyInfoAccess` 라는 애노테이션이 선언됐는지를 확인하고 그렇다면 뭔가를 하겠다는 것이다. 코드상에서는 간단하게 로그만 출력했지만 해당 정보를 추려서 별도로 DB에 저장할 계획이다. 그래서 `@Component` 를 선언하여 스프링 컨테이너에서 관리할 컴포넌트로 선언했다.

그리고 나름 중요한 부분이 `request.getAttribute("requestBody")` 이다. POST, PUT 방식으로 데이터를 전송할 때 RequestBody 에 요청정보가 담긴다. `HttpServletRequest` 에 `InputStream` 타입으로 저장되는데 이 정보를 읽으면 소멸되어 버린다. 

```java
log.debug("Body: {}", request.getReader().lines().collect(Collectors.joining(",")));
```

위처럼 HandlerInterceptor 에서 `HttpServletRequest` `reader` 를 호출하면 요런 로그를 확인할 수 있다.

```java
2020-06-18 10:08:42.785 ERROR 24930 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed; nested exception is java.lang.IllegalStateException: getReader() has already been called for this request] with root cause

java.lang.IllegalStateException: getReader() has already been called for this request
	at org.apache.catalina.connector.Request.getInputStream(Request.java:1057) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.connector.RequestFacade.getInputStream(RequestFacade.java:365) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.springframework.http.server.ServletServerHttpRequest.getBody(ServletServerHttpRequest.java:212) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.AbstractMessageConverterMethodArgumentResolver$EmptyBodyCheckingHttpInputMessage.<init>(AbstractMessageConverterMethodArgumentResolver.java:317) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.AbstractMessageConverterMethodArgumentResolver.readWithMessageConverters(AbstractMessageConverterMethodArgumentResolver.java:194) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.RequestResponseBodyMethodProcessor.readWithMessageConverters(RequestResponseBodyMethodProcessor.java:158) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.RequestResponseBodyMethodProcessor.resolveArgument(RequestResponseBodyMethodProcessor.java:131) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.method.support.HandlerMethodArgumentResolverComposite.resolveArgument(HandlerMethodArgumentResolverComposite.java:121) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.method.support.InvocableHandlerMethod.getMethodArgumentValues(InvocableHandlerMethod.java:167) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:134) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:105) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:879) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:793) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1040) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:943) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1006) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:909) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:660) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:883) ~[spring-webmvc-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:741) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:231) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:53) ~[tomcat-embed-websocket-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:119) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:119) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.springframework.boot.actuate.metrics.web.servlet.WebMvcMetricsFilter.doFilterInternal(WebMvcMetricsFilter.java:93) ~[spring-boot-actuator-2.3.0.RELEASE.jar:2.3.0.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:119) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:119) ~[spring-web-5.2.6.RELEASE.jar:5.2.6.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:202) ~[tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:96) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:541) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:139) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:92) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:343) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:373) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:65) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:868) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1590) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) [na:1.8.0_252]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) [na:1.8.0_252]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61) [tomcat-embed-core-9.0.35.jar:9.0.35]
	at java.lang.Thread.run(Thread.java:748) [na:1.8.0_252]
```

한마디로 줄이면,

> 네가 reader 를 호출해서 이 요청 처리를 할 수 없어!!

라는 의미다. 왜 컨텐츠를 바이너리데이터(Base64 인코딩)를 전송하는지는 못찾겠다!

- [https://developer.mozilla.org/ko/docs/Web/HTTP/Methods/POST](https://developer.mozilla.org/ko/docs/Web/HTTP/Methods/POST)
- [https://javaee.github.io/javaee-spec/javadocs/javax/servlet/ServletRequest.html](https://javaee.github.io/javaee-spec/javadocs/javax/servlet/ServletRequest.html)

어쨌든, Java EE 사양에 정의된 `ServletRequest`를 살펴보면 `getInputStream` 과  `getReader` 이 선언되어 있는 것을 확인할 수 있다. 둘 중에 편한 사용하기 편한유형을 선택하여 호출한다. 

> HttpServletRequest 에 담겨있는 정보를 반복적으로 읽을 수 있는 방법은 뭐가 있을까?

를 고민은 많은 자바 개발자가 했다. 그리고 그 결과들을 여기저기서 살펴볼 수 있다.

스프링 개발자도 마찬가지였는데 `spring-web` 모듈에 있는 `ContentCachingRequestWrapper`를 살펴볼 수 있다(p.s. 스프링 프레임워크 5.0 에서는 Serlvet 3.1 API 에 맞춰 작성되었던 코드가 현재(5.2.6)는 Servlet 4.0 스펙에 맞춰 변경되어있다). 

`ContentCachingRequestWrapper` 를 참고하여 다시 읽고쓸 수 있는 `ReadableHttpServletRequestWrapper` 를 작성해보자.

```java
import org.springframework.util.StreamUtils;

import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.*;

public class ReadableHttpServletRequestWrapper extends HttpServletRequestWrapper {
    private final byte[] bytes;

    /**
     * Constructs a request object wrapping the given request.
     *
     * @param request the {@link HttpServletRequest} to be wrapped.
     * @throws IllegalArgumentException if the request is null
     */
    public ReadableHttpServletRequestWrapper(HttpServletRequest request) throws IOException {
        super(request);

        InputStream inputStream = super.getInputStream();
        this.bytes = StreamUtils.copyToByteArray(inputStream);
    }

    @Override
    public ServletInputStream getInputStream() {
        return new CustomServletInputStream(this.bytes);
    }

    @Override
    public BufferedReader getReader() throws IOException {
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(this.bytes);
        return new BufferedReader(new InputStreamReader(byteArrayInputStream));
    }

    public String getRequestBody() {
        return new String(this.bytes);
    }

    private class CustomServletInputStream extends ServletInputStream {
        private final InputStream sourceInputStream;

        public CustomServletInputStream(byte[] body) {
            this.sourceInputStream = new ByteArrayInputStream(body);
        }

        @Override
        public boolean isFinished() {
            try {
                return sourceInputStream.available() == 0;
            } catch (IOException e) {
                return false;
            }
        }

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setReadListener(ReadListener readListener) {
            throw new UnsupportedOperationException();
        }

        @Override
        public int read() throws IOException {
            return this.sourceInputStream.read();
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            return this.sourceInputStream.read(b, off, len);
        }

        @Override
        public int read(byte[] b) throws IOException {
            return this.sourceInputStream.read(b);
        }

        @Override
        public long skip(long n) throws IOException {
            return this.sourceInputStream.skip(n);
        }

        @Override
        public int available() throws IOException {
            return this.sourceInputStream.available();
        }

        @Override
        public void close() throws IOException {
            this.sourceInputStream.close();
        }

        @Override
        public synchronized void mark(int readlimit) {
            this.sourceInputStream.mark(readlimit);
        }

        @Override
        public synchronized void reset() throws IOException {
            this.sourceInputStream.reset();
        }

        @Override
        public boolean markSupported() {
            return this.sourceInputStream.markSupported();
        }
    }
}
```

코드는 간단하다.  `HttpServletRequest` 이 가지고 있는 binary data(InputStream) 를 `ReadableHttpServletRequestWrapper` 내에 `bytes` 필드에 보관하고 `getReader` 혹은 `getInputStream` 메서드가 호출될 때 `CustomServletInputStream` 으로 감싸서 내보내는 형식이다. 참 쉽죠!?

2019년 이전의 자료들은 대부분 Servlet 3.1 API 를 구현한 것이라 `read` 메시지 이외의 것을 찾아보기 힘들다.

이제 `ReadableHttpServletRequestWrapperFilter` 필더를 작성한다.

```java
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@WebFilter
public class ReadableHttpServletRequestWrapperFilter implements Filter {
    public static final String REQUEST_BODY = "requestBody";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            ReadableHttpServletRequestWrapper requestWrapper = new ReadableHttpServletRequestWrapper((HttpServletRequest) request);
            requestWrapper.setAttribute(REQUEST_BODY, requestWrapper.getRequestBody());

            chain.doFilter(requestWrapper, response);
        } catch (Exception e) {
            chain.doFilter(request, response);
        }
    }
}
```

필터가 등록되면 `doFilter` 가 호출되는 순간 `HttpServletRequest` 를 `ReadableHttpServletRequestWrapper` 으로 감싼 후 Attribute 에 `requestBody`에 특정 값을 주입한다. 

그리고 `@WebFilter` 라는 애노테이션이 있는데, 해당 필터를 탐색할 수 있도록 하는 메타데이터 애노테이션이다.

이제 스프링 부트에 `@ServletComponentScan` 을 추가로 선언하면 `@WebFilter` 를 탐색하여 등록한다.

- [https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-embedded-container-servlets-filters-listeners-scanning](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-embedded-container-servlets-filters-listeners-scanning)
- `@ServletComponentScan` 을 선언하면 `@WebFilter` , `@WebServlet` 과 `@WebListener` 를 탐색하여 등록한다. 이 방법은 **임베디드 컨테이너를 사용하는 경우만 유효** 하다. 단독 실행되고 있는 컨테이너에 war 형태로 배포하는 경우는 별도로 `web.xml` 혹은 `SpringBootServletInitializer`에서 등록해야 한다.

다음과 같이 선언하면 `@WebFilter` 선언되어있는 필터를 임베디드 컨테이너 필터에 등록한다.

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@ServletComponentScan
@SpringBootApplication
public class TrainingProgrammingApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrainingProgrammingApplication.class, args);
    }
}
```

애플리케이션을 실행하고 `@PrivacyInfoAccess` 가 선언된 핸들러를 호출하면 다음과 같은 결과를 얻을 수 있다.

```java
// 호출
http POST localhost:8080/greeting statement=honeymon
HTTP/1.1 200
Connection: keep-alive
Content-Type: application/json
Date: Thu, 18 Jun 2020 01:44:50 GMT
Keep-Alive: timeout=60
Transfer-Encoding: chunked

{
    "statement": "honeymon"
}

// 실행결과로그
2020-06-18 10:44:50.570 DEBUG 25192 --- [nio-8080-exec-1] .s.h.PrivacyInfoAccessHandlerInterceptor : AccessInfo(Name: GreetingController/post, Description: test)
2020-06-18 10:44:50.571 DEBUG 25192 --- [nio-8080-exec-1] .s.h.PrivacyInfoAccessHandlerInterceptor : URI: POST /greeting
2020-06-18 10:44:50.571 DEBUG 25192 --- [nio-8080-exec-1] .s.h.PrivacyInfoAccessHandlerInterceptor : Body: {"statement": "honeymon"}
```

이제 요구사항에 맞춰서! 진행한다.

# 참고

- `ServletRequest`: [https://javaee.github.io/javaee-spec/javadocs/javax/servlet/ServletRequest.html](https://javaee.github.io/javaee-spec/javadocs/javax/servlet/ServletRequest.html)
- `HttpServletRequest`: [https://javaee.github.io/javaee-spec/javadocs/javax/servlet/http/HttpServletRequest.html](https://javaee.github.io/javaee-spec/javadocs/javax/servlet/http/HttpServletRequest.html)
- Interceptor: [https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-config-interceptors](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-config-interceptors)
- Add filter: [https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#howto-add-a-servlet-filter-or-listener](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#howto-add-a-servlet-filter-or-listener)
- `ContentCachingRequestWrapper`: [https://github.com/spring-projects/spring-framework/blob/master/spring-web/src/main/java/org/springframework/web/util/ContentCachingRequestWrapper.java](https://github.com/spring-projects/spring-framework/blob/master/spring-web/src/main/java/org/springframework/web/util/ContentCachingRequestWrapper.java)
- `MultiReadHttpServletRequest` : [https://github.com/holyeye/spring-trace/blob/master/spring-trace-web/src/main/java/spring/trace/web/MultiReadHttpServletRequest.java](https://github.com/holyeye/spring-trace/blob/master/spring-trace-web/src/main/java/spring/trace/web/MultiReadHttpServletRequest.java)