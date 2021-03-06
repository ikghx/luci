OS            = Linux
#NIXIO_TLS    ?= openssl
NIXIO_SHADOW ?= $(shell echo 'int main(void){ return !getspnam("root"); }' | $(CC) $(CFLAGS) -include shadow.h -xc -o/dev/null - 2>/dev/null && echo yes)
NIXIO_SO      = nixio.so
NIXIO_LDFLAGS = -llua -lm -ldl
CFLAGS       += -std=gnu99

ifeq (,$(findstring Darwin,$(OS)))
	NIXIO_LDFLAGS += -lcrypt -shared
else
        NIXIO_LDFLAGS += -bundle -undefined dynamic_lookup
	EXTRA_CFLAGS += -D__DARWIN__
endif

NIXIO_OBJ = nixio.o socket.o sockopt.o bind.o address.o \
	    protoent.o poll.o io.o file.o splice.o process.o \
	    syslog.o bit.o binary.o fs.o user.o \
	    $(if $(NIXIO_TLS),tls-crypto.o tls-context.o tls-socket.o,)

ifeq ($(NIXIO_TLS),openssl)
	NIXIO_LDFLAGS += -lssl -lcrypto
endif

ifeq ($(NIXIO_TLS),wolfssl)
	NIXIO_LDFLAGS += -lwolfssl
	TLS_CFLAGS = -include wolfssl-compat.h
endif

ifeq ($(NIXIO_TLS),)
	NIXIO_CFLAGS += -DNO_TLS
endif

ifneq ($(NIXIO_SHADOW),yes)
	NIXIO_CFLAGS += -DNO_SHADOW
endif


ifeq ($(OS),SunOS)
	NIXIO_LDFLAGS += -lsocket -lnsl -lsendfile
endif

ifneq (,$(findstring MINGW,$(OS))$(findstring mingw,$(OS))$(findstring Windows,$(OS)))
	NIXIO_CROSS_CC:=$(shell command -v i586-mingw32msvc-cc)
ifneq (,$(NIXIO_CROSS_CC))
	CC:=$(NIXIO_CROSS_CC)
endif
	NIXIO_OBJ += mingw-compat.o
	NIXIO_LDFLAGS_POST:=-llua -lssl -lcrypto -lws2_32 -lgdi32
	FPIC:=
	EXTRA_CFLAGS += -D_WIN32_WINNT=0x0501
	LUA_CFLAGS:=
	NIXIO_SO:=nixio.dll
	NIXIO_LDFLAGS:=
endif


%.o: %.c
	$(CC) $(CPPFLAGS) $(CFLAGS) $(NIXIO_CFLAGS) $(LUA_CFLAGS) $(FPIC) -c -o $@ $< 

ifneq ($(NIXIO_TLS),)
tls-crypto.o: $(TLS_DEPENDS) tls-crypto.c
	$(CC) $(CPPFLAGS) $(CFLAGS) $(NIXIO_CFLAGS) $(LUA_CFLAGS) $(FPIC) $(TLS_CFLAGS) -c -o $@ tls-crypto.c

tls-context.o: $(TLS_DEPENDS) tls-context.c
	$(CC) $(CPPFLAGS) $(CFLAGS) $(NIXIO_CFLAGS) $(LUA_CFLAGS) $(FPIC) $(TLS_CFLAGS) -c -o $@ tls-context.c
	
tls-socket.o: $(TLS_DEPENDS) tls-socket.c
	$(CC) $(CPPFLAGS) $(CFLAGS) $(NIXIO_CFLAGS) $(LUA_CFLAGS) $(FPIC) $(TLS_CFLAGS) -c -o $@ tls-socket.c
endif	

compile: $(NIXIO_OBJ)
	$(CC) $(LDFLAGS) $(SHLIB_FLAGS) -o $(NIXIO_SO) $(NIXIO_OBJ) $(NIXIO_LDFLAGS) $(NIXIO_LDFLAGS_POST)
	mkdir -p dist/usr/lib/lua
	cp $(NIXIO_SO) dist/usr/lib/lua/$(NIXIO_SO)

clean:
	rm -f *.o *.so *.a *.dll

install: compile
	mkdir -p $(DESTDIR)
	cp -pR dist/* $(DESTDIR)/
